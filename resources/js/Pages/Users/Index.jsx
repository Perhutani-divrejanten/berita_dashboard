import { useEffect, useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import SearchInput from '@/Components/SearchInput';
import Badge from '@/Components/Badge';
import EmptyState from '@/Components/EmptyState';

const roles = { admin: ['Admin', 'purple'], editor: ['Editor', 'blue'] };

export default function UsersIndex({ users, filters }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters?.search ?? '');
    const [role, setRole] = useState(filters?.role ?? 'all');
    const [status, setStatus] = useState(filters?.status ?? 'all');
    const [deletingId, setDeletingId] = useState(null);
    const timeout = useRef(null);

    useEffect(() => {
        const refresh = window.setInterval(() => router.reload({ only: ['users', 'filters'] }), 30000);
        return () => { window.clearInterval(refresh); clearTimeout(timeout.current); };
    }, []);

    const apply = (params) => router.get(route('users.index'), params, { preserveState: true, preserveScroll: true, replace: true });
    const handleSearch = (value) => {
        setSearch(value); clearTimeout(timeout.current);
        timeout.current = setTimeout(() => apply({ search: value, role, status }), 400);
    };
    const initials = (user) => (user.name || user.username || '?').split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
    const deleteUser = (user) => {
        if (!window.confirm(`Hapus pengguna "${user.name}"? Berita yang dibuatnya tetap dipertahankan.`)) return;
        router.delete(route('users.destroy', user.id), { preserveScroll: true, onStart: () => setDeletingId(user.id), onFinish: () => setDeletingId(null) });
    };

    return (
        <AuthenticatedLayout title="Pengguna">
            <Head title="Pengguna" />
            <div className="mx-auto max-w-7xl">
                <PageHeader title="Manajemen Pengguna" subtitle="Kelola akun dan hak akses pengguna sistem" action={{ href: route('users.create'), label: 'Tambah Pengguna', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg> }} />
                <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <SearchInput value={search} onChange={handleSearch} placeholder="Cari nama, username, atau email..." />
                    <select value={role} onChange={(e) => { setRole(e.target.value); apply({ search, role: e.target.value, status }); }} className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"><option value="all">Semua Peran</option><option value="admin">Admin</option><option value="editor">Editor</option></select>
                    <select value={status} onChange={(e) => { setStatus(e.target.value); apply({ search, role, status: e.target.value }); }} className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"><option value="all">Semua Status</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select>
                </div></div>
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    {users.data.length === 0 ? <EmptyState title="Tidak ada pengguna" description="Coba ubah pencarian atau filter." action={<Link href={route('users.create')} className="rounded-lg bg-perhutani-700 px-4 py-2 text-sm font-semibold text-white">Tambah Pengguna</Link>} /> : <>
                        <div className="overflow-x-auto"><table className="w-full min-w-[760px]"><thead className="border-b border-gray-200 bg-gray-50"><tr>{['Pengguna', 'Email', 'Role', 'Status', 'Berita', 'Login Terakhir', 'Aksi'].map((heading) => <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{heading}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">
                            {users.data.map((user) => { const roleInfo = roles[user.role] || roles.user; return <tr key={user.id} className="hover:bg-gray-50"><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-perhutani-700 text-center text-xs font-bold leading-9 text-white">{user.profile_photo_url ? <img src={user.profile_photo_url} alt={user.name} className="h-full w-full object-cover" /> : initials(user)}</div><div><p className="text-sm font-medium text-gray-800">{user.name}</p><p className="text-xs text-gray-400">@{user.username}</p></div></div></td><td className="px-4 py-3 text-sm text-gray-600">{user.email}</td><td className="px-4 py-3"><Badge color={roleInfo[1]} size="sm">{roleInfo[0]}</Badge></td><td className="px-4 py-3"><Badge color={user.is_active ? 'green' : 'red'} size="sm">{user.is_active ? 'Aktif' : 'Nonaktif'}</Badge></td><td className="px-4 py-3 text-sm text-gray-600">{user.beritas_count}</td><td className="px-4 py-3 text-xs text-gray-500">{user.last_login ? new Date(user.last_login).toLocaleDateString('id-ID') : 'Belum login'}</td><td className="px-4 py-3"><div className="flex justify-end gap-1"><Link href={route('users.edit', user.id)} title="Edit" className="rounded p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 012.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></Link><button type="button" title="Hapus" disabled={deletingId === user.id || auth.user.id === user.id} onClick={() => deleteUser(user)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 01-1-1h-4a1 1 0 01-1 1v3M4 7h16" /></svg></button></div></td></tr>; })}
                        </tbody></table></div><div className="flex flex-wrap justify-center gap-1 border-t border-gray-200 bg-gray-50 p-3">{users.links.map((link, index) => link.url ? <Link key={index} href={link.url} preserveScroll className={`rounded border px-3 py-1.5 text-sm ${link.active ? 'border-perhutani-700 bg-perhutani-700 text-white' : 'border-gray-300 bg-white text-gray-700'}`} dangerouslySetInnerHTML={{ __html: link.label }} /> : <span key={index} className="rounded border border-gray-200 px-3 py-1.5 text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: link.label }} />)}</div></>}
                </div><p className="mt-4 text-center text-xs text-gray-400">Total: {users.total} pengguna</p>
            </div>
        </AuthenticatedLayout>
    );
}
