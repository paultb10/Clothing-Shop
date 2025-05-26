"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Button } from "@/app/components/button";
import { Input } from "@/app/components/button";

export default function Page() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({ email: '', password: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateForm = () => {
        let isValid = true;
        let newErrors = { email: '', password: '' };
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!formData.email || !emailRegex.test(formData.email)) {
            newErrors.email = "Must be a valid email address";
            isValid = false;
        }

        if (!formData.password || formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const response = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Răspuns login:", data);

                const token = data.token;
                const userId = data.id;
                const roleId = data.role;
                const email = data.email;

                console.log("User ID la login cont:", userId);
                console.log("role:", roleId);
                console.log("token:", token);
                console.log("email:", email);

                if (token && userId && roleId) {
                    localStorage.clear();

                    localStorage.setItem('token', token);
                    localStorage.setItem('userId', userId);
                    localStorage.setItem('role', roleId);
                    localStorage.setItem('userEmail', email);

                    window.dispatchEvent(new Event('cart-updated'));
                    window.dispatchEvent(new Event('wishlist-updated'));

                    alert("Login successful!");

                    if (roleId === "ADMIN") {
                        window.location.href = "/add-product";
                    } else {
                        window.location.href = "/homepage";
                    }
                }

                else {
                    alert("No token or userId received from server.");
                }

            } else {
                const data = await response.json();
                alert(`Login failed: ${data.message || response.status}`);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while logging in.");
        }
    };


    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-blue-100 to-indigo-100">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6">
                <div className="flex justify-center">
                    <img src="/DSCN7709.jpg" alt="Logo" className="w-16 h-16 rounded-full"/>
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800">Welcome 👋</h2>
                    <p className="text-sm text-gray-600">Please enter your credentials to access your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <Input
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 text-black"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <Input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            className="mt-1 pr-10 text-black"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-3 top-7 text-gray-500"
                            aria-label="Toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                        </button>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md">
                        Login
                    </Button>
                </form>

                <p className="text-sm text-center text-gray-600">
                    Don't have an account? <Link href="/register" className="text-blue-600 hover:underline">Create
                    one</Link>
                </p>
            </div>
        </div>

    );
}
