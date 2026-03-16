"use client"
import { useState } from "react";
// import group from "./group.png";
// import image11 from "./image-11.png";
// import line1 from "./line-1.svg";
// import line2 from "./line-2.svg";

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleGoogleRegister = () => {};

  return (
    <div className="bg-[#d4eefb] overflow-hidden w-full min-w-[1920px] min-h-[1080px] relative">
      <div className="top-[540px] left-[-442px] w-[553px] h-[553px] bg-[#53bab3b2] rounded-[276.5px] blur-[100px] absolute aspect-[1]" />

      <div className="top-[-371px] left-[927px] w-[553px] h-[553px] bg-[#53bab3b2] rounded-[276.5px] blur-[100px] absolute aspect-[1]" />

      <div className="top-[-302px] left-[299px] w-[542px] h-[542px] bg-[#ffe5f3cc] rounded-[271px] blur-[100px] absolute aspect-[1]" />

      <div className="top-[171px] left-[1000px] w-[542px] h-[542px] bg-[#ffe5f3cc] rounded-[271px] blur-[100px] absolute aspect-[1]" />

      <div className="top-[908px] left-[-49px] w-[593px] h-[593px] bg-[#ffe5f3cc] rounded-[296.5px] blur-[100px] absolute aspect-[1]" />

      <div className="top-[684px] left-[482px] w-[542px] h-[542px] bg-[#9ad9f8cc] rounded-[271px] blur-[100px] absolute aspect-[1]" />

      <div className="top-[-116px] left-[-216px] w-[542px] h-[542px] bg-[#9ad9f8cc] rounded-[271px] blur-[100px] absolute aspect-[1]" />

      <div className="top-3 left-[902px] w-[483px] h-[483px] rounded-[241.5px] bg-[linear-gradient(159deg,rgba(255,250,194,1)_0%,rgba(255,255,10,1)_100%)] absolute aspect-[1]" />

      <img
        className="absolute w-[1620px] h-[1080px] top-0 left-[300px] aspect-[1.5]"
        alt="Group"
        src="/images/group.png"
      />

      <div className="absolute top-[calc(50.00%_-_415px)] left-[90px] w-[620px] h-[830px] bg-white rounded-[20px] shadow-[0px_0px_15px_#0000004c]" />

      <form
        onSubmit={handleSubmit}
        className="flex-col w-[620px] h-[830px] gap-[30px] px-0 py-10 absolute top-[125px] left-[90px] flex items-center"
        noValidate
      >
        <div className="h-[90px] justify-center gap-2.5 px-[30px] py-2.5 relative self-stretch w-full flex items-center">
          <h1 className="flex-1 h-[114px] mt-[-23.00px] mb-[-21.00px] [font-family:'Poppins-Bold',Helvetica] font-bold text-[#0c72a6] text-[64px] relative flex items-center justify-center text-center tracking-[0] leading-[normal]">
            Sign Up
          </h1>
        </div>

        <label className="flex w-[530px] items-center gap-5 px-[30px] py-3 relative flex-[0_0_auto] bg-white rounded-[50px] border border-solid border-neutral-400 cursor-text">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            autoComplete="username"
            className="relative flex items-center justify-center w-full mt-[-1.00px] [font-family:'Poppins-Regular',Helvetica] font-normal text-neutral-400 text-xl text-center tracking-[0] leading-[normal] placeholder:text-neutral-400 focus:text-[#2c2c2c] bg-transparent border-0 outline-none appearance-none"
          />
        </label>

        <label className="flex w-[530px] items-center gap-5 px-[30px] py-3 relative flex-[0_0_auto] bg-white rounded-[50px] border border-solid border-neutral-400 cursor-text">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            autoComplete="email"
            className="relative flex items-center justify-center w-full mt-[-1.00px] [font-family:'Poppins-Regular',Helvetica] font-normal text-neutral-400 text-xl text-center tracking-[0] leading-[normal] placeholder:text-neutral-400 focus:text-[#2c2c2c] bg-transparent border-0 outline-none appearance-none"
          />
        </label>

        <label className="flex w-[530px] items-center gap-5 px-[30px] py-3 relative flex-[0_0_auto] bg-white rounded-[50px] border border-solid border-neutral-400 cursor-text">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            autoComplete="new-password"
            className="relative flex items-center justify-center w-full mt-[-1.00px] [font-family:'Poppins-Regular',Helvetica] font-normal text-neutral-400 text-xl text-center tracking-[0] leading-[normal] placeholder:text-neutral-400 focus:text-[#2c2c2c] bg-transparent border-0 outline-none appearance-none"
          />
        </label>

        <label className="flex w-[530px] items-center gap-5 px-[30px] py-3 relative flex-[0_0_auto] bg-white rounded-[50px] border border-solid border-neutral-400 cursor-text">
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Konfirmasi Password"
            autoComplete="new-password"
            className="relative flex items-center justify-center w-full mt-[-1.00px] [font-family:'Poppins-Regular',Helvetica] font-normal text-neutral-400 text-xl text-center tracking-[0] leading-[normal] placeholder:text-neutral-400 focus:text-[#2c2c2c] bg-transparent border-0 outline-none appearance-none"
          />
        </label>

        <div className="w-[530px] justify-center gap-3.5 p-2.5 relative flex-[0_0_auto] flex items-center">
          <img
            className="ml-[-9.50px] relative w-60 h-px object-cover"
            alt="Line"
            src="/images/line-1.png"
          />

          <div className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Poppins-Regular',Helvetica] font-normal text-[#2c2c2c] text-xl text-center tracking-[0] leading-[normal]">
            or
          </div>

          <img
            className="mr-[-9.50px] relative w-60 h-px object-cover"
            alt="Line"
            src="/images/line-2.png"
          />
        </div>

        <button
          type="button"
          onClick={handleGoogleRegister}
          className="w-[530px] justify-center gap-3 px-[30px] py-3 relative flex-[0_0_auto] bg-white rounded-[50px] border border-solid border-neutral-400 flex items-center cursor-pointer hover:bg-neutral-50 transition-colors"
        >
          <img
            className="relative w-[22px] h-[22px] aspect-[1] object-cover"
            alt="Image"
            src="/images/image-11.png"
          />

          <div className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Poppins-Regular',Helvetica] font-normal text-[#2c2c2c] text-xl text-center tracking-[0] leading-[normal]">
            Register with Google
          </div>
        </button>

        <button
          type="submit"
          className="w-[530px] h-14 justify-center gap-5 px-[30px] py-3 relative bg-[#0c72a6] rounded-[50px] flex items-center cursor-pointer hover:bg-[#0a5f8a] transition-colors"
        >
          <div className="w-fit [font-family:'Poppins-Medium',Helvetica] font-medium text-white text-xl relative flex items-center justify-center text-center tracking-[0] leading-[normal]">
            Sign Up
          </div>
        </button>

        <div className="h-10 justify-center gap-2.5 p-2.5 relative self-stretch w-full flex items-center">
          <p className="relative flex items-center justify-center w-fit mt-[-6.00px] mb-[-4.00px] [font-family:'Poppins-Regular',Helvetica] font-normal text-[#0c72a6] text-xl text-center tracking-[0] leading-[normal]">
            <span>Already have an account? </span>
            <a
              href="#"
              className="underline hover:text-[#0a5f8a] transition-colors"
            >
              Sign In
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};
