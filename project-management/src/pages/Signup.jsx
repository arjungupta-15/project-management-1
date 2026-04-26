import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register, sendOTP } from "../features/authSlice";
import { UserPlus, Mail, Lock, User, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, loading, error } = useSelector((state) => state.auth);

    useEffect(() => {
        if (user) {
            const redirectUrl = localStorage.getItem("redirectUrl");
            if (redirectUrl) {
                localStorage.removeItem("redirectUrl");
                navigate(redirectUrl);
            } else {
                navigate("/");
            }
        }
        if (error) {
            toast.error(error);
        }
    }, [user, error, navigate]);

    const handleSendOTP = async () => {
        if (!email || !name || !password) {
            return toast.error("Please fill all fields first");
        }
        const result = await dispatch(sendOTP(email));
        if (sendOTP.fulfilled.match(result)) {
            setOtpSent(true);
            toast.success("OTP sent to your email");
        } else {
            toast.error(result.payload?.message || "Failed to send OTP");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!otpSent) return;
        dispatch(register({ name, email, password, otp }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center size-12 rounded-xl bg-blue-600/10 text-blue-600 mb-4">
                        <UserPlus className="size-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h1>
                    <p className="text-gray-500 dark:text-zinc-400 mt-2">Join us to start managing your projects</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={otpSent}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white disabled:opacity-60"
                                    placeholder="Sudhanshu Gupta"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={otpSent}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white disabled:opacity-60"
                                    placeholder="name@company.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={otpSent}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white disabled:opacity-60"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {otpSent && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Enter OTP</label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                                        placeholder="123456"
                                        maxLength={6}
                                        required
                                    />
                                </div>
                                <p className="mt-2 text-xs text-zinc-500 flex items-center gap-1 justify-end">
                                    Wrong email? <button onClick={() => setOtpSent(false)} className="text-blue-500 hover:underline">Change</button>
                                </p>
                            </div>
                        )}
                    </div>

                    {!otpSent ? (
                        <button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={loading || !email || !name || !password}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 group"
                        >
                            {loading ? <Loader2 className="size-5 animate-spin" /> : (
                                <>
                                    Verify Email
                                    <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    ) : (
                        <form onSubmit={handleSubmit} className="w-full">
                            <button
                                type="submit"
                                disabled={loading || otp.length < 6}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="size-5 animate-spin" /> : "Complete Signup"}
                            </button>
                        </form>
                    )}
                </div>

                <p className="text-center mt-8 text-sm text-gray-500 dark:text-zinc-400">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-600 hover:underline font-medium">Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
