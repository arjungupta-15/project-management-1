import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { acceptWorkspaceInvite } from "../features/workspaceSlice";
import { Loader2Icon, CheckCircleIcon, XCircleIcon } from "lucide-react";
import toast from "react-hot-toast";

const AcceptInvite = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    
    const [status, setStatus] = useState("loading"); // loading, success, error
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!user) {
            // Store the current URL to redirect back after login
            localStorage.setItem("redirectUrl", window.location.pathname + window.location.search);
            navigate("/login");
            return;
        }

        if (!token) {
            setStatus("error");
            setErrorMessage("Invalid invitation link.");
            return;
        }

        const handleAccept = async () => {
            try {
                await dispatch(acceptWorkspaceInvite(token)).unwrap();
                setStatus("success");
                toast.success("Successfully joined the workspace!");
                setTimeout(() => {
                    navigate("/");
                }, 3000);
            } catch (error) {
                setStatus("error");
                setErrorMessage(error?.message || "Failed to accept invitation.");
            }
        };

        handleAccept();
    }, [token, user, dispatch, navigate]);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-zinc-950 px-6 text-center">
            <div className="max-w-md w-full p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                {status === "loading" && (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2Icon className="size-12 text-blue-500 animate-spin" />
                        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Joining Workspace...</h1>
                        <p className="text-zinc-500 dark:text-zinc-400">Please wait while we process your invitation.</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center gap-4">
                        <CheckCircleIcon className="size-12 text-green-500" />
                        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Welcome Aboard!</h1>
                        <p className="text-zinc-500 dark:text-zinc-400">You have successfully joined the workspace. Redirecting you to the dashboard...</p>
                    </div>
                )}

                {status === "error" && (
                    <div className="flex flex-col items-center gap-4">
                        <XCircleIcon className="size-12 text-red-500" />
                        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Invitation Failed</h1>
                        <p className="text-red-500 font-medium">{errorMessage}</p>
                        <button 
                            onClick={() => navigate("/")}
                            className="mt-4 px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium hover:opacity-90 transition"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AcceptInvite;
