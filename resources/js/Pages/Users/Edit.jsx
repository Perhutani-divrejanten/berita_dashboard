import { useForm } from '@inertiajs/react';
import { UserForm } from './Create';

export default function UsersEdit({ user }) {
    const { data, setData, put, processing, errors } = useForm({ username: user.username || '', name: user.name || '', email: user.email || '', role: user.role || 'user', password: '', password_confirmation: '', is_active: !!user.is_active });
    const submit = (event) => { event.preventDefault(); put(route('users.update', user.id)); };
    return <UserForm title="Edit Pengguna" data={data} setData={setData} errors={errors} processing={processing} submit={submit} editing />;
}
