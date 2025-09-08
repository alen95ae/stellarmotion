"use client";

import GoogleMapWrapper from "@/components/GoogleMapWrapper";

export default function Page() {
  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Smoke test Google Maps</h1>
      <div className="h-[420px] rounded-lg overflow-hidden border">
        <GoogleMapWrapper
          center={{ lat: -16.5, lng: -68.15 }}
          markers={[{ lat: -16.5, lng: -68.15 }]}
          className="h-full"
        />
      </div>
    </main>
  );
}
