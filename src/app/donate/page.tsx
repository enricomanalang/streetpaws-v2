'use client';

import { Button } from '@/components/ui/button';

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-orange-600 tracking-wide">DONATE ONLINE</h1>
            <div className="mt-4 bg-orange-100 border border-orange-300 rounded-xl p-5 max-w-2xl">
              <p className="font-extrabold text-orange-700">
                “HELP US MAKE STREETS SAFER FOR ANIMALS”
              </p>
              <p className="text-xs text-orange-700 mt-1">
                YOUR DONATION SUPPORTS RESCUE, CARE, AND COMMUNITY EDUCATION FOR STRAY ANIMALS.
              </p>
            </div>
            <div className="mt-6">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 py-6 text-lg font-extrabold">
                DONATE
              </Button>
            </div>
            <div className="grid sm:grid-cols-3 gap-6 mt-10 max-w-3xl">
              <div className="text-center">
                <div className="text-sm text-gray-700 mb-2">Pet food</div>
                <div className="bg-white rounded-2xl shadow-sm border p-2">
                  <img src="/file.svg" alt="Pet food" className="w-full h-40 object-contain" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-700 mb-2">Medicine</div>
                <div className="bg-white rounded-2xl shadow-sm border p-2">
                  <img src="/vercel.svg" alt="Medicine" className="w-full h-40 object-contain" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-700 mb-2">Cages</div>
                <div className="bg-white rounded-2xl shadow-sm border p-2">
                  <img src="/next.svg" alt="Cages" className="w-full h-40 object-contain" />
                </div>
              </div>
            </div>
          </div>
          <div className="hidden md:block w-[360px]">
            <img src="/window.svg" alt="Donation illustration" className="w-full h-auto" />
            <div className="mt-6 flex flex-col items-center gap-4">
              <img src="/globe.svg" alt="Cat" className="w-40 h-40 object-contain" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}



