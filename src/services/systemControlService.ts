import { supabase } from '../lib/supabase';

export interface SystemFeatures {
  chat: boolean;
  quiz: boolean;
  englishTest: boolean;
  profileEdit: boolean;
  openDayModule: boolean;
}

export interface SystemAnnouncement {
  active: boolean;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string | null;
}

export interface SystemControl {
  id: string;
  features: SystemFeatures;
  announcement: SystemAnnouncement;
  updated_by: string | null;
  updated_at: string;
  created_at: string;
}

export const getSystemControl = async (): Promise<SystemControl | null> => {
  try {
    const { data, error } = await supabase
      .from('system_control')
      .select('*')
      .eq('id', 'status')
      .single();

    if (error) {
      // If no rows found (PGRST116), create default entry
      if (error.code === 'PGRST116') {
        console.log('No system control entry found, creating default...');
        return await createDefaultSystemControl();
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error fetching system control:', error);
    return null;
  }
};

const createDefaultSystemControl = async (): Promise<SystemControl | null> => {
  try {
    const defaultControl = {
      id: 'status',
      features: {
        chat: true,
        quiz: true,
        englishTest: true,
        profileEdit: true,
        openDayModule: true,
      },
      announcement: {
        active: false,
        message: '',
        type: 'info' as const,
        timestamp: null,
      },
      updated_by: null,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('system_control')
      .insert(defaultControl)
      .select()
      .single();

    if (error) throw error;
    console.log('Default system control created successfully');
    return data;
  } catch (error) {
    console.error('Error creating default system control:', error);
    return null;
  }
};

export const updateSystemControl = async (
  features: SystemFeatures,
  announcement: SystemAnnouncement,
  userId: string
): Promise<SystemControl | null> => {
  try {
    const { data, error } = await supabase
      .from('system_control')
      .update({
        features,
        announcement: {
          ...announcement,
          timestamp: announcement.active ? new Date().toISOString() : null,
        },
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 'status')
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating system control:', error);
    throw error;
  }
};

export const subscribeToSystemControl = (
  callback: (control: SystemControl | null) => void
) => {
  const channel = supabase
    .channel('system-control-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'system_control',
      },
      async (payload) => {
        console.log('System control changed:', payload);
        const control = await getSystemControl();
        callback(control);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
