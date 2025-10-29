"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";

const schema = yup.object().shape({
  username: yup.string().required("Nom d'utilisateur requis"),
  password: yup.string().min(6, "Mot de passe trop court").required("Mot de passe requis"),
  role: yup.string().oneOf(["admin", "user", "psychology"]).required("Rôle requis"),
});

export default function Signup() {
  const { signup } = useAuth();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = (data: { username: string; password: string; role: "admin" | "user" | "psychology" }) => {
    if (signup(data.username, data.password, data.role)) {
      router.push("/");
    } else {
      alert("Nom d'utilisateur déjà pris");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Créer un compte</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
            <input type="text" {...register("username")} className="mt-1 block w-full border rounded-md p-2" />
            {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input type="password" {...register("password")} className="mt-1 block w-full border rounded-md p-2" />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Rôle</label>
            <select {...register("role")} className="mt-1 block w-full border rounded-md p-2">
              <option value="">Sélectionner</option>
              <option value="admin">Admin</option>
              <option value="user">Utilisateur simple</option>
              <option value="psychology">Psychologue</option>
            </select>
            {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
          </div>
          <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-md">S'inscrire</button>
        </form>
        <p className="mt-4 text-center">
          Déjà un compte ? <Link href="/login" className="text-blue-500">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}