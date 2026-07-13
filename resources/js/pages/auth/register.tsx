import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="nombre" className="text-white/80">Nombre Completo</Label>
                                <Input
                                    id="nombre"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="nombre"
                                    placeholder="Nombre y Apellidos"
                                    className="bg-[#120202] border-[#3a0d16] text-white rounded-xl focus-visible:ring-[#ffb6c5] focus-visible:border-[#ffb6c5] placeholder:text-white/20 py-5"
                                />
                                <InputError
                                    message={errors.nombre}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-white/80">Correo Electrónico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="correo@ejemplo.com"
                                    className="bg-[#120202] border-[#3a0d16] text-white rounded-xl focus-visible:ring-[#ffb6c5] focus-visible:border-[#ffb6c5] placeholder:text-white/20 py-5"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-white/80">Contraseña</Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Contraseña"
                                    passwordrules={passwordRules}
                                    className="bg-[#120202] border-[#3a0d16] text-white rounded-xl focus-visible:ring-[#ffb6c5] focus-visible:border-[#ffb6c5] placeholder:text-white/20 py-5"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation" className="text-white/80">
                                    Confirmar Contraseña
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Confirmar Contraseña"
                                    passwordrules={passwordRules}
                                    className="bg-[#120202] border-[#3a0d16] text-white rounded-xl focus-visible:ring-[#ffb6c5] focus-visible:border-[#ffb6c5] placeholder:text-white/20 py-5"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full bg-[#ffb6c5] text-[#1b0308] hover:bg-[#ffc6d2] font-bold py-6 rounded-xl transition-colors shadow-lg shadow-[#ffb6c5]/20"
                                tabIndex={5}
                                data-test="register-user-button"
                                disabled={processing}
                            >
                                {processing && <Spinner />}
                                Crear Cuenta
                            </Button>
                        </div>

                        <div className="text-center text-sm text-white/50">
                            ¿Ya tienes una cuenta?{' '}
                            <TextLink href={login()} tabIndex={6} className="text-[#ffb6c5] hover:text-[#ffc6d2]">
                                Iniciar Sesión
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Create an account',
    description: 'Enter your details below to create your account',
};
