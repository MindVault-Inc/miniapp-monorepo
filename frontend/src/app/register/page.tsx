"use client";

import { Input } from "@/components/ui/input";
import { FilledButton } from "@/components/ui/FilledButton";
import { useState } from "react";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    age: "",
    subscription: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-screen h-[354px] -mt-4">
        <div className="w-screen absolute top-0 bg-white rounded-b-[65px] shadow-[inset_-5px_-5px_25px_0px_rgba(134,152,183,1.00),inset_5px_5px_25px_0px_rgba(248,248,246,1.00)]" />
        <div className="w-screen h-full px-[34px] pt-[104px] pb-[70px] absolute top-0 bg-[#2c5154] rounded-b-[65px] shadow-[21px_38px_64.69999694824219px_3px_rgba(0,0,0,0.25)] overflow-hidden">
          <div className="max-w-md mx-auto">
            <h1 className="text-white text-[50px] font-medium font-spaceGrotesk leading-[50px]">
              Let&apos;s get to know a little bit about you...
            </h1>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md p-4 mt-4">
        <p className="text-center text-[#232931] text-base font-normal mb-8">
          Please fill up the following spaces to begin.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[#232931] text-base">Name</label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-[30px] bg-[#d9d9d9] rounded-[20px] border-0"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[#232931] text-base">Last Name</label>
            <Input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="h-[30px] bg-[#d9d9d9] rounded-[20px] border-0"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[#232931] text-base">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-[30px] bg-[#d9d9d9] rounded-[20px] border-0"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[#232931] text-base">Age</label>
            <Input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="h-[30px] bg-[#d9d9d9] rounded-[20px] border-0"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.subscription}
              onChange={(e) => setFormData({ ...formData, subscription: e.target.checked })}
              className="w-5 h-5 rounded-full bg-[#d9d9d9]"
            />
            <label className="text-[#232931] text-base">
              I would like to receive updates and insights.
            </label>
          </div>

          <FilledButton
            variant="default"
            size="sm"
            className="w-[109px] h-9 bg-[#e36c59] mx-auto"
            type="submit"
          >
            Enter
          </FilledButton>
        </form>
      </div>
    </div>
  );
} 