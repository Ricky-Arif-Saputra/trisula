import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { RmeKeys } from '../components/screens/LatihanTypes';

// =====================================================
// Types
// =====================================================
export type Strand = 'bilangan' | 'aljabar' | 'geometri' | 'trigonometri' | 'peluang';
export type Difficulty = 'mudah' | 'sedang' | 'sulit';
export type TestType = 'latihan' | 'pretest' | 'postest';

export interface ContentBlock {
  id: string;
  type: 'text' | 'latex' | 'image';
  value: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  is_correct: boolean;
}

export interface Question {
  id: string;
  title: string;
  test_type: TestType;
  strand: Strand;
  category: Difficulty;
  content_blocks: ContentBlock[];
  options: QuestionOption[];
  has_simulation: boolean;
  created_by: string;
  created_at: string;
  rme_keys?: RmeKeys;
}

// =====================================================
// Hook: useQuestions
// Ambil data dari Supabase + Realtime subscription
// =====================================================
export function useQuestions(strand: Strand | null, testType: TestType = 'latihan', category?: Difficulty) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    if (!strand) {
      setQuestions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('questions')
        .select('*')
        .ilike('strand', strand)
        .eq('test_type', testType)
        .order('created_at', { ascending: true });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setQuestions((data as Question[]) || []);
    } catch (err: any) {
      console.error('[useQuestions] Fetch error:', err);
      setError(err.message || 'Gagal memuat soal dari database.');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [strand, testType, category]);

  // Initial fetch
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // =====================================================
  // Supabase Realtime: auto-update when questions change
  // =====================================================
  useEffect(() => {
    if (!strand) return;

    const channelName = `questions-student-${strand}-${testType}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'questions',
          filter: `strand=ilike.${strand}`,
        },
        (_payload) => {
          // Auto-refresh data saat ada perubahan (INSERT/UPDATE/DELETE)
          fetchQuestions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [strand, testType, fetchQuestions]);

  return { questions, loading, error, refetch: fetchQuestions };
}
