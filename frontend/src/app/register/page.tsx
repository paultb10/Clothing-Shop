"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Button } from "@/app/components/button";
import { Input } from "@/app/components/button";

export default function Page() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        address: '',
    });
    const [errors, setErrors] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        address: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const validateForm = () => {
        let isValid = true;
        let newErrors = {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            address: ''
        };

        if (!formData.firstName || formData.firstName.length < 2 || formData.firstName.length > 50) {
            newErrors.firstName = "First name must be between 2 and 50 characters";
            isValid = false;
        }

        if (!formData.lastName || formData.lastName.length < 2 || formData.lastName.length > 50) {
            newErrors.lastName = "Last name must be between 2 and 50 characters";
            isValid = false;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            newErrors.email = "Must be a valid email address";
            isValid = false;
        }

        if (!formData.password || formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
            isValid = false;
        }

        if (!formData.address) {
            newErrors.address = "Address is required";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const requestData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            address: formData.address,
        };

        try {
            const response = await fetch("http://localhost:8080/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                const data = await response.json();
                const userId = data.id;
                console.log("User ID la creare cont:", userId);

                if (userId) {
                    localStorage.setItem('userId', userId);
                }

                alert("Account created successfully!");
                window.location.href = "/login";
            } else {
                const data = await response.json();
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while registering.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-indigo-100 to-blue-100">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6">
                <div className="flex justify-center">
                    <img src="/DSCN7709.jpg" alt="Logo" className="w-16 h-16 rounded-full"/>
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800">Create an Account 📝</h2>
                    <p className="text-sm text-gray-600">Fill in your details below to sign up</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <Input
                                type="text"
                                name="firstName"
                                placeholder="John"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="mt-1 text-black"
                            />
                            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <Input
                                type="text"
                                name="lastName"
                                placeholder="Doe"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="mt-1 text-black"
                            />
                            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
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
                            placeholder="At least 8 characters"
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <Input
                            type="text"
                            name="address"
                            placeholder="Cluj-Napoca, Romania"
                            value={formData.address}
                            onChange={handleChange}
                            className="mt-1 text-black"
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                    </div>

                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md">
                        Create Account
                    </Button>
                </form>

                <p className="text-sm text-center text-gray-600">
                    Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
}
