import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Log in" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-white/80">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                    className="bg-[#120202] border-[#3a0d16] text-white rounded-xl focus-visible:ring-[#ffb6c5] focus-visible:border-[#ffb6c5] placeholder:text-white/20 py-5"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password" className="text-white/80">Password</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm text-[#ffb6c5] hover:text-[#ffc6d2]"
                                            tabIndex={5}
                                        >
                                            Forgot your password?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                    className="bg-[#120202] border-[#3a0d16] text-white rounded-xl focus-visible:ring-[#ffb6c5] focus-visible:border-[#ffb6c5] placeholder:text-white/20 py-5"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="border-[#3a0d16] data-[state=checked]:bg-[#ffb6c5] data-[state=checked]:text-[#1b0308]"
                                />
                                <Label htmlFor="remember" className="text-white/80">Remember me</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full bg-[#ffb6c5] text-[#1b0308] hover:bg-[#ffc6d2] font-bold py-6 rounded-xl transition-colors shadow-lg shadow-[#ffb6c5]/20"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Iniciar Sesión
                            </Button>
                        </div>

                        <div className="text-center text-sm text-white/50">
                            Don't have an account?{' '}
                            <TextLink href={register()} tabIndex={5} className="text-[#ffb6c5] hover:text-[#ffc6d2]">
                                Sign up
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Log in to your account',
    description: 'Enter your email and password below to log in',
};
