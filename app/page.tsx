import { createClient } from '@/lib/supabase/server';

export default async function Instruments() {
  const supabase = await createClient();
  
  // Try counting rows first
  const { count, error: countError } = await supabase
    .from("test")
    .select("*", { count: 'exact', head: true });
  
  const { data: instruments, error } = await supabase.from("test").select();

  return (
    <div>
      <h2>Row Count:</h2>
      <pre>Count: {count}, Error: {JSON.stringify(countError, null, 2)}</pre>
      <h2>Data:</h2>
      <pre>{JSON.stringify(instruments, null, 2)}</pre>
      <h2>Error:</h2>
      <pre>{JSON.stringify(error, null, 2)}</pre>
    </div>
  )
}