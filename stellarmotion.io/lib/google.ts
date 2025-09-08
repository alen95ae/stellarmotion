import { Loader } from "@googlemaps/js-api-loader";

let loader: Loader | null = null;
let promise: Promise<typeof google> | null = null;

export function loadGoogle(): Promise<typeof google> {
  if (promise) return promise;
  
  loader ||= new Loader({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY!,
    libraries: ["places"],
    language: "es",
    region: "ES",
  });
  
  promise = loader.load();
  return promise;
}
