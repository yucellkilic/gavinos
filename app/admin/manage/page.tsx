import { supabaseAdmin } from '@/lib/supabase';
import AdminDashboard from '@/components/AdminDashboard';
import { MenuItem } from '@/types/menu';

export const dynamic = 'force-dynamic'; // Admin panel should always be fresh

export default async function AdminManagePage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const search = searchParams.search || '';
  
  let query = supabaseAdmin
    .from('menu_items')
    .select('*')
    .order('item_name');

  if (search) {
    query = query.ilike('item_name', `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return <div className="p-10 text-red-500">Error loading items: {error.message}</div>;
  }

  const items = (data || []).map((item: any) => ({
    ...item,
    name: item.item_name,
    base_price: item.item_price,
  })) as MenuItem[];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
            <p className="text-gray-600">Update prices and manage 1,783 products</p>
          </div>
          <div className="bg-forestGreen/10 text-forestGreen px-4 py-2 rounded-lg font-bold border border-forestGreen/20">
            Secure Mode: Service Role
          </div>
        </header>

        <AdminDashboard initialItems={items as MenuItem[]} />
      </div>
    </div>
  );
}
