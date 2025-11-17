import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import OpenAI from 'openai';

admin.initializeApp();

const db = admin.firestore();

const openai = new OpenAI({
  apiKey: functions.config().openai?.key || process.env.OPENAI_API_KEY,
});

interface GovernorCommandRequest {
  command: string;
  args?: Record<string, any>;
}

interface GovernorCommandResult {
  success: boolean;
  message: string;
  details?: any;
}

async function logAuditEvent(
  eventType: string,
  actorId: string,
  actorRole: string,
  details: any
): Promise<void> {
  await db.collection('audit').add({
    eventType,
    actorId,
    actorRole,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    details,
  });
}

async function logGovernorCommand(
  command: string,
  args: Record<string, any> | undefined,
  issuedBy: string,
  result: GovernorCommandResult
): Promise<void> {
  await db.collection('governorCommands').add({
    command,
    args,
    issuedBy,
    issuedAt: admin.firestore.FieldValue.serverTimestamp(),
    result,
  });
}

async function hasPermission(uid: string, permission: string): Promise<boolean> {
  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists) return false;

  const userData = userDoc.data();
  if (!userData) return false;

  if (userData.role === 'governor') return true;

  const roleDoc = await db.collection('governorRoles').doc(userData.role).get();
  if (!roleDoc.exists) return false;

  const roleData = roleDoc.data();
  return roleData?.permissions?.[permission] === true;
}

export const runGovernorCommand = functions.https.onCall(async (data: GovernorCommandRequest, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { uid } = context.auth;
  const { command, args } = data;

  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists) {
    throw new functions.https.HttpsError('permission-denied', 'User not found');
  }

  const userData = userDoc.data();
  if (!userData) {
    throw new functions.https.HttpsError('permission-denied', 'Invalid user data');
  }

  const canManageSystem = await hasPermission(uid, 'manageSystem');
  if (!canManageSystem && userData.role !== 'governor') {
    throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
  }

  let result: GovernorCommandResult;

  try {
    const [action, ...params] = command.split(' ');

    switch (action) {
      case 'disable':
      case 'enable': {
        const featureName = params[0];
        const enabled = action === 'enable';

        const systemControlRef = db.collection('systemControl').doc('status');
        const systemControl = await systemControlRef.get();

        if (!systemControl.exists) {
          throw new Error('System control not found');
        }

        const features = systemControl.data()?.features || {};
        features[featureName] = enabled;

        await systemControlRef.update({
          features,
          updatedBy: uid,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        result = {
          success: true,
          message: `Feature '${featureName}' ${enabled ? 'enabled' : 'disabled'} successfully`,
          details: { feature: featureName, enabled },
        };

        await logAuditEvent('feature_toggle', uid, userData.role, {
          feature: featureName,
          enabled,
        });
        break;
      }

      case 'announce': {
        if (!args) throw new Error('Announcement args required');

        const { message, type, expiresAt } = args;

        await db.collection('systemControl').doc('status').update({
          announcement: {
            active: true,
            message,
            type: type || 'info',
            startedAt: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt: expiresAt || null,
          },
          updatedBy: uid,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        result = {
          success: true,
          message: 'Announcement published successfully',
          details: { message, type },
        };

        await logAuditEvent('announcement_created', uid, userData.role, { message, type });
        break;
      }

      case 'maintenance': {
        const mode = params[0];
        const maintenanceMessage = params.slice(1).join(' ') || 'System maintenance in progress';

        await db.collection('systemControl').doc('status').update({
          maintenance: {
            active: mode === 'on',
            message: maintenanceMessage,
            startedAt: mode === 'on' ? admin.firestore.FieldValue.serverTimestamp() : null,
          },
          updatedBy: uid,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        result = {
          success: true,
          message: `Maintenance mode ${mode === 'on' ? 'enabled' : 'disabled'}`,
          details: { active: mode === 'on', message: maintenanceMessage },
        };

        await logAuditEvent('maintenance_toggle', uid, userData.role, { active: mode === 'on' });
        break;
      }

      case 'downgradeUser': {
        if (!args || !args.uid || !args.toPlan) {
          throw new Error('downgradeUser requires {uid, toPlan}');
        }

        const targetUserRef = db.collection('users').doc(args.uid);
        await targetUserRef.update({
          plan: args.toPlan,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        result = {
          success: true,
          message: `User downgraded to ${args.toPlan}`,
          details: { targetUid: args.uid, newPlan: args.toPlan },
        };

        await logAuditEvent('user_downgraded', uid, userData.role, {
          targetUid: args.uid,
          newPlan: args.toPlan,
        });
        break;
      }

      case 'lockContent':
      case 'unlockContent': {
        if (!args || !args.courseId) {
          throw new Error(`${action} requires {courseId}`);
        }

        const locked = action === 'lockContent';
        await db.collection('courses').doc(args.courseId).update({
          locked,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        result = {
          success: true,
          message: `Course ${locked ? 'locked' : 'unlocked'} successfully`,
          details: { courseId: args.courseId, locked },
        };

        await logAuditEvent('course_lock_toggle', uid, userData.role, {
          courseId: args.courseId,
          locked,
        });
        break;
      }

      case 'revokeDownloads': {
        const revoked = args?.revoked === true;

        await db.collection('systemControl').doc('status').update({
          'features.downloads': !revoked,
          updatedBy: uid,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        result = {
          success: true,
          message: `Downloads ${revoked ? 'revoked' : 'enabled'}`,
          details: { downloadsEnabled: !revoked },
        };

        await logAuditEvent('downloads_toggle', uid, userData.role, { enabled: !revoked });
        break;
      }

      case 'suspendUser': {
        if (!args || !args.uid) {
          throw new Error('suspendUser requires {uid}');
        }

        await db.collection('users').doc(args.uid).update({
          status: 'suspended',
          suspendedAt: admin.firestore.FieldValue.serverTimestamp(),
          suspendedBy: uid,
        });

        result = {
          success: true,
          message: 'User suspended successfully',
          details: { targetUid: args.uid },
        };

        await logAuditEvent('user_suspended', uid, userData.role, { targetUid: args.uid });
        break;
      }

      case 'forceLogout': {
        if (!args || !args.uid) {
          throw new Error('forceLogout requires {uid}');
        }

        await db.collection('users').doc(args.uid).update({
          forceLogout: admin.firestore.FieldValue.serverTimestamp(),
        });

        result = {
          success: true,
          message: 'User will be forced to logout',
          details: { targetUid: args.uid },
        };

        await logAuditEvent('force_logout', uid, userData.role, { targetUid: args.uid });
        break;
      }

      default:
        result = {
          success: false,
          message: `Unknown command: ${action}`,
        };
    }

    await logGovernorCommand(command, args, uid, result);
    return result;
  } catch (error: any) {
    result = {
      success: false,
      message: error.message || 'Command execution failed',
      details: { error: error.toString() },
    };

    await logGovernorCommand(command, args, uid, result);
    throw new functions.https.HttpsError('internal', result.message);
  }
});

export const triggerManualBackup = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { uid } = context.auth;

  const canManageSystem = await hasPermission(uid, 'manageSystem');
  if (!canManageSystem) {
    throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
  }

  try {
    const backupId = `backup_${Date.now()}`;

    await db.collection('backups').doc(backupId).set({
      triggeredBy: uid,
      triggeredAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending',
      location: null,
      notes: 'Manual backup triggered',
    });

    await logAuditEvent('backup_triggered', uid, 'governor', { backupId });

    return {
      success: true,
      message: 'Backup initiated successfully',
      backupId,
      note: 'Firestore exports require GCS configuration. Set up Firebase CLI with: firebase firestore:export gs://your-bucket',
    };
  } catch (error: any) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

export const aiAssistantProxy = functions.https.onCall(async (data: { prompt: string; context?: any }, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { uid } = context.auth;

  const aiControlDoc = await db.collection('systemControl').doc('ai').get();
  const aiEnabled = aiControlDoc.exists ? aiControlDoc.data()?.enabled !== false : true;

  if (!aiEnabled) {
    throw new functions.https.HttpsError('failed-precondition', 'AI features are currently disabled by system administrator');
  }

  try {
    const { prompt, context: userContext } = data;

    if (!prompt || prompt.trim().length === 0) {
      throw new functions.https.HttpsError('invalid-argument', 'Prompt cannot be empty');
    }

    const systemPrompt = `You are an operations assistant for Crews Academy, a flight crew training platform.
You help governors manage the system, analyze data, and make informed decisions.
Provide concise, actionable insights. Current context: ${JSON.stringify(userContext || {})}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content || 'No response generated';

    await db.collection('aiUsageLogs').add({
      userId: uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      promptLength: prompt.length,
      modelUsed: completion.model,
      tokensUsed: completion.usage?.total_tokens || 0,
      success: true,
    });

    await logAuditEvent('ai_assistant_query', uid, 'user', { promptLength: prompt.length, tokensUsed: completion.usage?.total_tokens });

    return {
      success: true,
      reply,
      tokensUsed: completion.usage?.total_tokens || 0,
    };
  } catch (error: any) {
    console.error('AI Assistant Error:', error);

    await db.collection('aiUsageLogs').add({
      userId: uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      promptLength: data.prompt?.length || 0,
      modelUsed: 'gpt-4-turbo-preview',
      tokensUsed: 0,
      success: false,
      error: error.message,
    });

    throw new functions.https.HttpsError('internal', 'AI request failed: ' + error.message);
  }
});

export const fetchLargeMetrics = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { uid } = context.auth;

  const canViewAudit = await hasPermission(uid, 'viewAudit');
  if (!canViewAudit) {
    throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
  }

  try {
    const [usersSnapshot, coursesSnapshot, conversationsSnapshot, supportTicketsSnapshot] = await Promise.all([
      db.collection('users').get(),
      db.collection('courses').get(),
      db.collection('conversations').get(),
      db.collection('supportTickets').get(),
    ]);

    const usersByRole: Record<string, number> = {};
    const usersByPlan: Record<string, number> = {};

    usersSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      usersByRole[data.role] = (usersByRole[data.role] || 0) + 1;
      usersByPlan[data.plan] = (usersByPlan[data.plan] || 0) + 1;
    });

    const metrics = {
      totalUsers: usersSnapshot.size,
      totalCourses: coursesSnapshot.size,
      totalConversations: conversationsSnapshot.size,
      totalSupportTickets: supportTicketsSnapshot.size,
      usersByRole,
      usersByPlan,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('metrics').doc('summary').set(metrics);

    return { success: true, metrics };
  } catch (error: any) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

const stripe = new Stripe(functions.config().stripe?.secret_key || process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

export const stripeWebhookHandler = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = functions.config().stripe?.webhook_secret || process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    res.status(500).send('Webhook secret not configured');
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    switch (event.type) {
      case 'customer.created': {
        const customer = event.data.object as Stripe.Customer;
        await db.collection('stripe').doc('customers').collection('list').doc(customer.id).set({
          ...customer,
          syncedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await db.collection('stripe').doc('invoices').collection('list').doc(invoice.id).set({
          ...invoice,
          syncedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await logAuditEvent('payment_succeeded', 'system', 'stripe', {
          invoiceId: invoice.id,
          amount: invoice.amount_paid,
          customer: invoice.customer,
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await db.collection('stripe').doc('invoices').collection('list').doc(invoice.id).set({
          ...invoice,
          syncedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await logAuditEvent('payment_failed', 'system', 'stripe', {
          invoiceId: invoice.id,
          customer: invoice.customer,
        });
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await db.collection('stripe').doc('payments').collection('list').doc(charge.id).set({
          ...charge,
          syncedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await logAuditEvent('charge_refunded', 'system', 'stripe', {
          chargeId: charge.id,
          amount: charge.amount_refunded,
        });
        break;
      }

      case 'subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await db.collection('stripe').doc('subscriptions').collection('list').doc(subscription.id).set({
          ...subscription,
          syncedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        await logAuditEvent('dispute_created', 'system', 'stripe', {
          disputeId: dispute.id,
          amount: dispute.amount,
          reason: dispute.reason,
        });
        break;
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    res.status(500).send('Webhook processing failed');
  }
});

export const syncStripeToFirestore = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const canManageBilling = await hasPermission(context.auth.uid, 'manageBilling');
  if (!canManageBilling) {
    throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
  }

  try {
    const customers = await stripe.customers.list({ limit: 100 });

    for (const customer of customers.data) {
      await db.collection('stripe').doc('customers').collection('list').doc(customer.id).set({
        ...customer,
        syncedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return { success: true, message: `Synced ${customers.data.length} customers` };
  } catch (error: any) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
