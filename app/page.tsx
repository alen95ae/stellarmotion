"use client"
import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, MapPin, Heart, Eye, Ruler, Building, Globe, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PartnersSection } from "@/components/PartnersSection"
import SearchBar from "@/components/SearchBar"
import { CATEGORY_MAPPING } from "@/lib/icons"

// Custom SVG icons for categories based on your design
const CategoryIcon = ({ type }: { type: string }) => {
  const iconProps = { className: "w-12 h-12", fill: "none", stroke: "currentColor", strokeWidth: "2" }

  switch (type) {
    case "valla":
      return (
        <svg {...iconProps} viewBox="0 0 400.58 425.8">
          <rect x="48.05" y="83.66" width="304.53" height="165.14" className="fill-[#e94446]"/>
          <path d="M227.28,254.88v3q0,32.83,0,65.65a5.84,5.84,0,0,0,1.68,4.43c5.48,5.82,10.8,11.77,16.31,17.55a6,6,0,0,0,3.38,1.46c2,.25,4,0,6,.17a12.31,12.31,0,0,1,11,12.15c.08,3,.06,6,0,9S264,373,260.89,373.2c-.75,0-1.5,0-2.25,0H141.83c-5.76,0-6.93-1.13-6.89-6.82a55.78,55.78,0,0,1,.4-9.43c1.11-6,5.9-10.16,12-9.81,4.5.27,7.37-1.32,10.15-4.61,4.66-5.52,9.75-10.69,14.59-16.07a4.33,4.33,0,0,0,1.16-2.56q.09-33.94,0-67.9a7.33,7.33,0,0,0-.18-1c-.91,0-1.87-.11-2.82-.12H54.47a14.62,14.62,0,0,1-2.73-.14A4.13,4.13,0,0,1,48,250.44c0-.75,0-1.5,0-2.24Q48,166.57,48,85c0-4.78,1.24-6,6.11-6,7.32,0,14.64,0,22,0,1.55,0,2.42-.22,3.06-2,1.81-5,5.58-7.85,11-7.94,8.48-.13,17-.15,25.46,0,5.81.11,9.35,3.23,11.63,9.77.66,0,1.39.12,2.12.12,14.81,0,29.62,0,44.43,0,1.51,0,2.28-.28,2.85-1.91,1.78-5.15,5.89-8,11.41-8q12.34-.1,24.71,0a11.64,11.64,0,0,1,11.36,8.15c.41,1.15.75,1.81,2.15,1.8,15.47,0,31,0,46.42,0a2.58,2.58,0,0,0,.69-.17c3.05-7.69,6.14-9.76,14.55-9.77C295,69,302,69,309.1,69c6.56,0,10.08,2.48,12.66,8.53a3.1,3.1,0,0,0,2.37,1.36c7.4.11,14.81.06,22.21.07,5,0,6.24,1.18,6.24,6.12V248.8c0,4.77-1.29,6.08-6.07,6.08H227.28ZM56.84,87.89v158H343.76V87.9h-21.6c0,1.86,0,3.58,0,5.31,0,3.7-1.45,5.14-5.14,5.15q-19.22,0-38.44,0c-3.74,0-5.22-1.54-5.27-5.35,0-1.7,0-3.41,0-5.05H224.73c0,1.94,0,3.68,0,5.42-.06,3.36-1.58,5-4.85,5q-19.59,0-39.19,0c-3.16,0-4.74-1.61-4.81-4.75-.05-1.89,0-3.77,0-5.68H127.27c0,2,.08,4,0,5.85-.16,2.93-1.72,4.56-4.52,4.57q-20,.06-39.94,0c-2.74,0-4.27-1.64-4.35-4.4-.07-2,0-4,0-6Zm138.92,259c.05-.93.12-1.74.12-2.55,0-5.4,0-10.81,0-16.22,0-3.43,1.72-5.47,4.48-5.43s4.3,2.07,4.32,5.34c0,5.4,0,10.81,0,16.22v2.57h13.74V255.07H182.12v91.81ZM144,364.27H256.52c1-7.88-.24-8.48-6.55-8.46q-49.51.15-99,0c-7.47,0-7.36,1.21-7.14,7.83A3.42,3.42,0,0,0,144,364.27Zm-57-274.73h31.39c0-2.87,0-5.59,0-8.3-.06-2.39-1.13-3.42-3.61-3.43-8.06,0-16.11,0-24.17,0-2.25,0-3.46,1.17-3.56,3.3C87,83.8,87.08,86.53,87.08,89.54Zm195.06,0h31.34c0-3,.13-5.93-.05-8.8a2.9,2.9,0,0,0-3.13-2.91q-12.46,0-24.92,0a2.92,2.92,0,0,0-3.22,3.06C282.07,83.68,282.14,86.5,282.14,89.52Zm-66.19,0c0-3,.07-5.78,0-8.51a3,0,0,0-3.32-3.24c-8.23,0-16.47-.09-24.7.1-1.06,0-2.87,1.35-3,2.24a79.42,79.42,0,0,0-.15,9.41Zm-42.78,248.8-7.86,8.52h7.86Zm61.37,8.55-7.09-7.6v7.6Z" className="fill-black"/>
          <path d="M200.1,237.45H77.3a27.13,27.13,0,0,1-3-.07A4.19,4.19,0,0,1,70.38,233a4.3,4.3,0,0,1,4-4.37,16.68,16.68,0,0,1,2.24,0q123.66,0,247.34,0a11.48,11.48,0,0,1,3.42.37,3.91,3.91,0,0,1,2.85,4.43,4,4,0,0,1-3.55,3.9,16.52,16.52,0,0,1-3,.13Z" className="fill-black"/>
          <rect x="84.38" y="75.38" width="37.27" height="16.25" className="fill-black"/>
          <rect x="181.71" y="75.54" width="37.27" height="16.25" className="fill-black"/>
          <rect x="279.19" y="75.54" width="37.27" height="16.25" className="fill-black"/>
        </svg>
      )
    case "mupis":
      return (
        <svg {...iconProps} viewBox="0 0 400.58 425.8">
          <rect x="134.96" y="106.78" width="133.02" height="170.95" className="fill-[#e94446]"/>
          <path d="M159.89,344.82V305.56h-2.73c-5.82-.09-11.69.26-17.46-.36-13.77-1.49-23.28-12.63-23.88-27.38,0-1,0-2.09,0-3.13q0-81.13-.05-162.27c0-8.38,1.83-15.88,7.43-22,5.07-5.56,11.27-8.65,18.59-8.66q63.7-.08,127.4,0c13.57,0,24.89,11.49,25.86,25.83.1,1.36.15,2.73.15,4.09q0,81.74,0,163.47c0,5.2-.53,10.26-2.9,14.91-5.2,10.15-13.35,15.21-24.15,15.5-4.84.13-9.69,0-14.54,0h-2.54V344.7c.93.05,1.73.12,2.54.12,5.53,0,11,0,16.58,0,9.9.06,16.65,7.24,16.71,17.72,0,2.41,0,4.81,0,7.22,0,4.58-1.07,5.72-5.33,5.72H129.41c-4.28,0-5.34-1.13-5.35-5.7,0-2.57,0-5.13,0-7.7.13-9.9,6.88-17.11,16.23-17.25,5.68-.08,11.36,0,17,0Zm127.36-151.2q0-41.64,0-83.28c0-11.57-8.18-20.28-19.11-20.29q-62.55-.08-125.1,0c-11.23,0-19.3,8.66-19.31,20.56q0,83,0,166.08c0,11.74,8.13,20.34,19.22,20.34q62.55,0,125.1,0a16.9,16.9,0,0,0,3.83-.33c9.6-2.24,15.37-9.87,15.38-20.28Q287.27,235,287.25,193.62ZM168,305.69c0,.9-.1,1.68-.1,2.46,0,11.39,0,22.78-.05,34.17,0,2.05.59,2.52,2.44,2.52q35.06-.09,70.12,0c.8,0,1.6-.08,2.46-.13v-39ZM131.72,367H279c0-.77,0-1.32.09-1.88.64-7.28-2.52-11.92-11-11.87-41.84.25-83.69.11-125.53.11-.91,0-1.82,0-2.73,0a7.73,7.73,0,0,0-7.32,6.07A57.16,57.16,0,0,0,131.72,367Z" className="fill-black"/>
          <path d="M135,193.45q0-43.33,0-86.67c0-4.82,1.09-6,5.59-6H270.22c4.77,0,5.81,1.14,5.81,6.27q0,86.57,0,173.11c0,5.09-1.08,6.24-5.85,6.24H140.75c-4.7,0-5.8-1.14-5.8-6Q135,236.92,135,193.45Zm8-84.12v168.4H268V109.33Z" className="fill-black"/>
        </svg>
      )
    case "led":
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="16" rx="2" className="fill-[#D7514C]/20 stroke-[#D7514C]" />
          <circle cx="8" cy="10" r="1" className="fill-[#D7514C]" />
          <circle cx="12" cy="10" r="1" className="fill-[#D7514C]" />
          <circle cx="16" cy="10" r="1" className="fill-[#D7514C]" />
          <circle cx="8" cy="14" r="1" className="fill-[#D7514C]" />
          <circle cx="12" cy="14" r="1" className="fill-[#D7514C]" />
          <circle cx="16" cy="14" r="1" className="fill-[#D7514C]" />
        </svg>
      )
    case "pantalla":
      return (
        <svg {...iconProps} viewBox="0 0 400.58 425.8">
          <rect x="76.04" y="105.16" width="253.83" height="130.34" className="fill-[#e94446]"/>
          <path d="M229.05,259v2.91c0,21.13,0,42.27.07,63.4a6.83,6.83,0,0,0,1.58,4.14c5.12,5.8,10.39,11.47,15.71,17.09a5.08,5.08,0,0,0,3,1.27c2.38.29,4.84,0,7.18.48a11.44,11.44,0,0,1,9.37,11.08c.09,3.08.07,6.16,0,9.24-.06,2.74-1.58,4.29-4.31,4.52-.74.07-1.49,0-2.24,0H146.56c-5.29,0-6.49-1.16-6.44-6.42,0-3.15-.2-6.37.37-9.44a11,11,0,0,1,11.57-9.3c4.41.24,7.19-1.37,9.89-4.59,4.32-5.17,9.1-9.94,13.59-15a5.43,5.43,0,0,0,1.41-3.23c.08-21.46.06-42.93.05-64.4,0-.48-.07-1-.14-1.82h-120c-5.09,0-6.09-1-6.09-6.13v-164c0-4.82,1.2-6,6.07-6H349.1c5.07,0,6.21,1.13,6.21,6.11v164c0,5-1,6-5.94,6H229.05Zm117.69-8.51V91.5H59.32v159ZM198.88,347.73v-2.94c0-5.07,0-10.14,0-15.21,0-3.27,1.5-5.14,4.08-5.19s4.17,1.85,4.2,5.06,0,6.66,0,10v8.24h13.18V259.19H185.67v88.54Zm-50.1,16.77H257.27c.67-7.36.09-8.27-7-8.24q-47.25.17-94.52,0C148.68,356.23,148.13,357.16,148.78,364.5Zm28.08-24.95-7.49,8.11h7.49Zm59.15,8.2-6.77-7.27v7.27Z" className="fill-black"/>
          <path d="M203.05,239.06H78c-5.8,0-6.71-.88-6.71-6.58V106c0-4.77,1.31-6.1,6-6.1H328.92c4.41,0,5.82,1.43,5.82,5.82q0,63.89,0,127.78c0,4.35-1.29,5.62-5.67,5.62Zm16.37-130.61V111c0,5.08,0,10.15,0,15.23,0,3.58-1.55,5.53-4.31,5.49s-4.1-1.83-4.11-5.37V108.52H195.92v3.19q0,40.44,0,80.88a17.23,17.23,0,0,1-.07,2.49,4.27,4.27,0,0,1-4.22,3.83,4.17,4.17,0,0,1-4.08-4.2c0-.83,0-1.66,0-2.49V108.44H172.4v2.82c0,5.33,0,10.65,0,16,0,2.86-1.74,4.52-4.26,4.49s-4.05-1.69-4.06-4.62c0-5.33,0-10.65,0-16,0-.87-.09-1.75-.13-2.62h-15V191.8c0,1,0,2-.05,3a4.13,4.13,0,1,1-8.26-.06c0-.75,0-1.5,0-2.24v-84h-15.2c0,6.19,0,12.17,0,18.14,0,3.33-1.49,5.08-4.15,5.09S117,130,117,126.68c0-5.33-.07-10.65,0-16,0-1.81-.43-2.54-2.36-2.45a85.36,85.36,0,0,1-9.73,0c-2.53-.17-3.2.59-3.19,3.15.1,26.88.07,53.75.06,80.63a29.15,29.15,0,0,1-.08,3.24,4,4,0,0,1-4.08,3.62c-2.05-.15-3.68-1.11-4-3.38a21.71,21.71,0,0,1-.16-3.23q0-40.19,0-80.37a8.78,8.78,0,0,0-.06-2.24c-.14-.51-.69-1.28-1.08-1.29-4.12-.09-8.25-.05-12.42-.05V230.48H93.34c0-.63.1-1,.1-1.45,0-4.74,0-9.49.08-14.23a4.13,4.13,0,0,1,4.28-4.23,4.19,4.19,0,0,1,4,4.28c.07,1.49,0,3,0,4.49V230.7c4.35,0,8.34-.13,12.31.05,2.3.1,2.92-.6,2.92-2.91q-.12-40.56,0-81.12a18.42,18.42,0,0,1,.14-3.24,4.1,4.1,0,0,1,8.06.07,20.57,20.57,0,0,1,.13,3.24v83.68h15.21c0-5.38,0-10.53,0-15.67a4.12,4.12,0,1,1,8.23-.2c.14,3.07.06,6.16.07,9.23,0,2.22,0,4.43,0,6.67H164v-3.15q0-40.44,0-80.87a22.74,22.74,0,0,1,.05-2.74,3.85,3.85,0,0,1,3.85-3.57,3.78,3.78,0,0,1,4.15,2.89,12.79,12.79,0,0,1,.3,3.45q0,40.44,0,80.87v3.1h15.12v-1.69c0-4.66,0-9.32,0-14a4.11,4.11,0,0,1,4-4.24,4.23,4.23,0,0,1,4.26,3.76,23.34,23.34,0,0,1,.09,3.24c0,4.3,0,8.6,0,12.93H211V172.68q0-13.85,0-27.7c0-3,1.68-4.86,4.18-4.85s4.14,1.92,4.22,4.88c0,.66,0,1.33,0,2v83.7c4.62,0,8.85,0,13.09,0,.56,0,1.12-.1,2-.18V216.78c0-4.15,1.33-6.14,4.1-6.21s4.34,2.07,4.34,6.26v13.65h15v-3.19q0-40.44,0-80.87a18.75,18.75,0,0,1,.05-2.49,4.2,4.2,0,0,1,8.37.14c.08.82,0,1.66,0,2.49v84h15v-2.61c0-4.24-.05-8.49,0-12.73,0-2.72,1.86-4.61,4.22-4.62s4.17,1.88,4.21,4.61c.05,3.66,0,7.32,0,11v4.38h15v-3.1q0-40.56,0-81.12a12.73,12.73,0,0,1,.21-3,4.17,4.17,0,0,1,4.46-3.2,4.29,4.29,0,0,1,3.76,4c.06.83,0,1.66,0,2.49v83.87h12.7v-122h-12.7c0,6.28,0,12.35,0,18.41,0,3-1.59,4.82-4.18,4.82S305,130,304.94,127c-.05-1.5,0-3,0-4.49v-14h-15v84.8c0,3.56-1.55,5.6-4.23,5.62s-4.21-2.1-4.23-5.64V108.44H266.53c0,1-.11,1.76-.11,2.56,0,5.24,0,10.49,0,15.73,0,3.2-1.6,5-4.26,5S258,129.9,258,126.65c0-4,0-8,0-12v-6.15h-15v3.21q0,40.56,0,81.12a15.91,15.91,0,0,1-.08,2.49,4.34,4.34,0,0,1-4.21,3.58,4.26,4.26,0,0,1-4.08-3.7,18.78,18.78,0,0,1-.06-2.49V108.45Z" className="fill-black"/>
        </svg>
      )
    case "displays":
      return (
        <svg {...iconProps} viewBox="0 0 400.58 425.8">
          <polygon points="162.27 139.7 252.36 145.78 231.46 321.52 226.56 324.77 134.91 318.82 138.15 272.67 158.7 136.92 162.27 139.7" className="fill-[#e94446]"/>
          <path d="M277.76,314c-8.14,0-15.79-.16-23.42.17-1.17,0-3,2.19-3.23,3.58-1.89,11.68-3.34,23.43-5.3,35.09-.35,2.08-2.18,5.25-3.74,5.51-3.51.6-3.81-2.64-3.79-5.44s0-5.64,0-9.09c-3.15-.33-6-.75-8.94-.93-33.73-2.06-67.48-4-101.2-6.23-4.5-.29-6.07.71-5.74,5.41.25,3.45,1.51,9.13-3.7,9.07-5.43-.05-3.11-5.76-3.46-9.15-2.65-25.8,4.29-50.66,7.6-75.85,5.13-39.07,10.86-78.06,16.38-117.08,1-7.27,2.11-14.55,3.47-21.78,1.18-6.31,4.59-10.94,10.82-13.4,14.48-5.69,29.63-6.47,44.87-6.18,20.16.39,40,3.1,59.28,9.35,4.91,1.6,9.45,4.51,13.95,7.18,4.05,2.4,5.48,6.37,5.55,11.06.21,14.32.14,28.66.95,42.95,2.37,41.45,5.17,82.87,7.64,124.32a136.73,136.73,0,0,1-.37,19.09c-.13,1.59-2.4,3-3.69,4.51-1.31-1.46-3.21-2.73-3.78-4.45C277.25,319.7,277.76,317.31,277.76,314ZM121.61,328.15a32,32,0,0,0,3.5.61c37.28,2.25,74.56,4.53,111.86,6.55,1.42.08,3.88-2,4.27-3.52,1.13-4.35,1.44-8.92,2.08-13.4q12.6-88.51,25.19-177c1.38-9.69.46-11.91-8.74-15.17-31.58-11.21-63.95-14.31-97-7.89-9.59,1.87-13.26,6.69-14,16.45-.17,2.07-.35,4.14-.65,6.19q-4.66,32.77-9.39,65.53c-2.61,18.11-5.33,36.2-7.88,54.31C127.73,283.13,124.71,305.5,121.61,328.15Zm131.29-22h25.59c-2.43-40.41-4.84-80.37-7.24-120.33l-1.27,0Z" className="fill-black"/>
          <path d="M190.07,134c20.6,1.3,41.2,2.57,61.8,3.94,8.62.57,9,1,7.84,9.42q-10.47,76-21,152-1.66,12-3,24.12c-.49,4.3-2.22,6.2-6.93,5.86-30.51-2.15-61-4-91.57-6.08-7-.48-7.86-1.5-6.88-8.39,5.07-35.67,10.3-71.32,15.33-107q4.69-33.34,9-66.74c1.21-9.41,1.21-9.56,10.78-8.81,8.23.63,16.48,1.12,24.72,1.67ZM138.15,315.43l90,6.1c8.1-58.87,16.11-117.07,24.18-175.75l-90.09-6.08C154.23,198.24,146.24,256.47,138.15,315.43Z" className="fill-black"/>
        </svg>
      )
    case "caballete":
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M4 8h16l-2 8H6L4 8z" className="fill-[#D7514C]/20 stroke-[#D7514C]" />
          <path d="M6 16l-2 5M18 16l2 5" className="stroke-gray-700" />
        </svg>
      )
    case "parada-bus":
      return (
        <svg {...iconProps} viewBox="0 0 400.58 425.8">
          <polygon points="159.45 135.68 159.45 309.27 203.27 321.35 203.27 139.12 159.45 135.68" className="fill-[#e94446]"/>
          <polygon points="93.86 130.11 93.86 299.39 141.27 309.27 141.27 134.95 93.86 130.11" className="fill-[#e94446]"/>
          <polygon points="219.11 139.12 334.09 134.95 334.09 316.05 219.11 321.35 219.11 139.12" className="fill-[#e94446]"/>
          <path d="M300.75,334.68c-12.88.85-24.75,1.72-36.63,2.39-4.42.24-4.75,2.46-4.78,5.52-.09,7.71-.34,7.85-9.2,7.81-15.91-.08-14.44,1.42-14.49-12.55,0-4,0-8.08,0-12-11.24-2.05-11.86-1.64-11.86,7.36v.58c0,14.88,0,14.78-17,14.27-4.84-.15-7.06-1.87-7-6,0-4.67.17-9.35-.17-14a5.3,5.3,0,0,0-2.58-4c-2.79-1.15-6-1.54-9.08-2.2-7.57-1.62-15.15-3.22-23.67-5,0,4.8-.1,8.84,0,12.87.11,3.48-1.95,4.95-5.72,5.08-.22,0-.45,0-.67,0-23.53-.1-20.52,2.18-20.35-16.48,0-4.61-1.69-6.47-6.71-7.36-10.29-1.83-20.49-4.08-32.09-6.43,0,4.42-.26,8.39.07,12.33.45,5.36-1.65,7.75-8.36,7.75-15.8,0-15.8.2-15.8-13.64q0-87.51-.1-175c0-3.71-2.06-7.38-2.57-11.13-1.48-10.82,4.52-18.12,15-23.37a80.32,80.32,0,0,1,35.37-8.69c20.18-.12,40.41.6,60.57,1.68,34.63,1.85,69.24,4.1,103.83,6.54a156.56,156.56,0,0,1,25.86,4c19.82,4.82,27.64,14.29,27.59,32q-.09,28.83-.15,57.65c0,39.28-.09,78.56.09,117.85,0,5.38-1.37,8.58-8.38,8.74-1.32,0-3.48,2.22-3.66,3.57a74.22,74.22,0,0,0-.16,11.65c.12,4.09-1.86,6.2-6.8,6.08-3.83-.1-7.68-.15-11.5,0C303.79,342.89,299.67,341.71,300.75,334.68Zm29.48-22c.17-1.82.44-3.33.45-4.84,0-54.22,0-108.43.13-162.65,0-5-2.13-6.28-7.59-6Q277,141.32,230.73,143c-5.61.2-7.08,1.8-7.06,6.53.18,54.05.11,108.09.13,162.14,0,1.86.23,3.72.38,5.95Zm-193-8.38v-6.38q0-77.52,0-155c0-1.17.43-2.53-.12-3.45-.78-1.32-2.17-3.16-3.51-3.31-11.3-1.25-22.65-2.17-34.91-3.27V265.11c0,8.93-.14,17.87.13,26.8.06,1.73,1.36,4.61,2.73,4.92C113,299.51,124.55,301.71,137.24,304.29Zm62,11.76V142.94l-34.85-4v5.54q0,28.56,0,57.11c0,33.79-.07,67.59.15,101.39,0,2.18,1.72,5.81,3.52,6.28C178,311.91,188.38,313.79,199.2,316.05ZM325,119.37c-2.51-1.36-5.41-3.69-8.81-4.62-8.33-2.29-16.79-5-25.38-5.64q-66.67-4.6-133.44-8.09a311,311,0,0,0-38.38.18c-12.15.87-24.2,3.52-33.31,11.26-2.39,2-2.84,5.76-4.18,8.7,2.59.8,5.12,2,7.79,2.33,38.87,4.05,77.77,7.91,116.63,12,6.46.68,11.72-.37,16.58-4.26a37.44,37.44,0,0,1,9.67-5.1c18.62-7.33,38.41-9.55,58.62-9.06C302.14,117.35,313.43,118.56,325,119.37ZM146.66,326.54c6.87,1.66,9-.77,8.68-5.76-.19-2.71-.37-5.42-.37-8.13q-.08-83.08-.1-166.15v-8.28l-8.21-.53Zm62.45-85.23v90.94c0,1.36-.31,2.8.12,4.05s1.62,2.33,2.47,3.48a21.07,21.07,0,0,0,2.76-3.78c.44-1,.1-2.31.09-3.47q0-35-.08-69.92,0-56,.08-111.89a19.65,19.65,0,0,0-.47-5.2c-.17-.62-1.63-1.36-2.48-1.34a2.9,2.9,0,0,0-2.21,1.56,25.22,25.22,0,0,0-.27,5.22Q209.11,196.14,209.11,241.31ZM87,131l-2.71.91c-.13,1.52-.38,3-.38,4.56q0,87.47,0,174.94c0,1-.33,2.1.14,2.87.58,1,1.89,2.31,2.77,2.25a4,4,0,0,0,2.79-2.32c.48-1.44.17-3.08.16-4.64q0-53.94-.08-107.87c0-21.58.07-43.15-.11-64.73C89.56,135,87.92,133,87,131ZM235.76,135l86.8-3.53C309.73,121.62,255.16,124.1,235.76,135Zm82.58,186.4c-20.83,1.07-40.78,2.06-60.73,3.14-13,.71-13.14.77-12.67,12.2.08,1.86,1.77,3.67,2.71,5.5.85-1.73,2.44-3.47,2.39-5.18-.15-5.14,2.18-7.24,8.28-7.48C271.8,329,285.27,328,298.73,327c9.72-.7,9.71-.81,12.26,7.23h7.35Z" className="fill-black"/>
        </svg>
      )
    case "totem":
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <rect x="8" y="2" width="8" height="16" rx="1" className="fill-[#D7514C]/20 stroke-[#D7514C]" />
          <rect x="6" y="18" width="12" height="4" rx="1" className="stroke-gray-700" />
        </svg>
      )
    case "letreros":
      return (
        <svg {...iconProps} viewBox="0 0 400.58 425.8">
          <polygon points="104.81 117.58 104.81 302.4 114.19 310.33 163.39 305.23 167.31 294.99 167.31 124.88 163.39 117.77 104.81 117.58" className="fill-[#e94446]"/>
          <path d="M224.16,286.83c6.79,0,13.05,0,19.31,0,3.95,0,6.38,1.33,6.35,5.22q-.06,10.29,0,20.57c0,3.78-2.16,5.38-6.23,5.36-6.43,0-12.87,0-19.47,0-.16,1.68.1,2.9-.43,3.68a57.93,57.93,0,0,1-4.37,5.09c-1.47-1.76-4.14-3.47-4.22-5.27-.42-10.36-.22-20.74-.26-31.12a27.72,27.72,0,0,0-.52-3.3c-8.41,0-16.8-.12-25.18.18-.93,0-2.4,2.44-2.51,3.82-.33,4.19-.11,8.43-.11,12.65,0,13.94-8.91,21.95-24.43,22q-26.23,0-52.48,0c-14.35,0-23.65-8.26-23.66-21q0-94.43,0-188.85c0-12.91,9.44-21.35,24-21.42q26.53-.11,53.07,0c14.1.08,23.44,8.62,23.54,21.29,0,3,0,5.9,0,9.63h28.38V102.79c0-1.23,0-2.46,0-3.69,0-2.8.34-5.59,4.31-5.8,4.17-.22,4.46,2.63,4.57,5.42,0,.86.19,1.72.37,3.28,8,0,16.06.18,24-.06,5.15-.16,7.07,1.69,6.92,6.19-.22,6.49-.11,13,0,19.49.08,4.8-3,5.89-7.6,5.81-7.62-.13-15.25,0-23.33,0v56.18c6.27,0,12.49.16,18.7,0,5.17-.18,7,1.88,6.92,6.31-.18,6.86-.27,13.72,0,20.57.21,5.16-2.4,6.87-7.81,6.67-5.84-.23-11.7,0-17.92,0Zm-46.27-76.7q0-46.95,0-93.91c0-9.06-5.5-14-15.66-14.06q-25.36-.09-50.72,0c-11.78,0-16.84,4.58-16.84,15.16q0,92.85,0,185.71c0,10.21,4.73,14.63,16,14.69q25.37.14,50.72,0c11.76,0,16.53-4.32,16.54-14.76Q177.94,256.55,177.89,210.13Zm37.05-3.59V155.4c0-12.05,0-12.05-13.71-12.05-14.68,0-14.68,0-14.68,13.2,0,35.49.12,71-.13,106.46,0,5,1.7,6.45,7,6.08a113.36,113.36,0,0,1,15.31,0c4.9.32,6.39-1.22,6.33-5.61C214.8,244.49,214.94,225.52,214.94,206.54Zm9.33-96.25v14.59h21.82V110.29Zm-.39,87.05c0,5.21-.18,9.93.14,14.63a4.25,4.25,0,0,0,3,2.83c4.4.34,8.85.14,13.4.14v-17.6Zm16.68,98.09H224.38v14.23h16.18ZM214.15,135.05l0-1h-27l0,1ZM187,277.4c0,.56,0,1.13.08,1.7q13.6.31,27.21.07l-.05-1.77Z" className="fill-black"/>
          <path d="M292.76,102c7.45,0,14.91.08,22.36,0,4.49-.07,6.48,1.76,6.46,5.69-.05,6.68,0,13.35,0,20,0,3.93-2.36,5.74-6.62,5.74H270.22c-4,0-6.36-1.58-6.37-5.35q0-10.52,0-21c0-4,2.62-5,6.55-5,7.45.08,14.9,0,22.35,0ZM274.1,125.53h38.13v-15a7.41,7.41,0,0,0-1.52-.43q-12.09-.09-24.18-.12c-15.42,0-15.42,0-13.53,14C273,124.14,273.2,124.27,274.1,125.53Z" className="fill-black"/>
          <path d="M287.55,286.82c7.08,0,14.16.11,21.23,0,4.66-.1,7,1.48,6.88,5.84q-.21,9.75,0,19.52c.09,4.34-2.24,5.91-6.87,5.88-14.55-.1-29.1-.07-43.65,0-4.52,0-7-1.46-6.93-5.87.14-6.5.11-13,0-19.52-.1-4.41,2.48-5.86,7-5.82C272.61,286.87,280.08,286.82,287.55,286.82Zm18.76,23V295c-12.3,0-24.22-.08-36.13.11-1.14,0-3.12,1.62-3.21,2.6-.37,3.94-.15,7.93-.15,12.14Z" className="fill-black"/>
          <path d="M287.48,189.56c7.45,0,14.89.11,22.34,0,3.69-.07,5.67,1.32,5.71,4.52.1,8.06.05,16.13,0,24.2,0,3.27-2.05,4.76-5.58,4.77-15.3,0-30.59,0-45.89,0-3.7,0-5.87-1.53-5.85-5.12q.09-11.58,0-23.16c0-3.55,1.77-5.07,5.73-5,7.84.1,15.69,0,23.53,0Zm18.89,8.12a8.86,8.86,0,0,0-1.9-.49c-7.86,0-15.71-.1-23.56-.05-14.87.09-14.87.12-14.17,13.59,0,.53-.19,1.22.1,1.55.83,1,1.86,2.51,2.84,2.53,12.11.17,24.23.11,36.69.11Z" className="fill-black"/>
          <path d="M256.55,269.2c-7.66,0-15.33-.12-23,.05-4.69.11-7-1.6-7-5.8,0-6.67,0-13.35.07-20,0-3.67,2.1-5.3,6.3-5.28q23.86.15,47.72,0c4.14,0,6.27,1.44,6.27,5.24q0,10,.09,20c0,4.15-2.1,6-6.88,5.87-7.85-.19-15.71,0-23.56,0Zm-20.87-8H266.4c13.11,0,13.11,0,11.71-11.65,0-.17.06-.41,0-.51-.91-.91-1.84-2.56-2.79-2.57-13.08-.17-26.16-.11-39.6-.11Z" className="fill-black"/>
          <path d="M256.72,174.22c-7.64,0-15.28-.15-22.91.05-4.95.14-7.36-1.61-7.29-6.09.08-5.61.16-11.23.09-16.85,0-4,2.18-5.71,6.53-5.66q23.79.27,47.58.44c3.32,0,5.79.77,5.83,4.37.06,6,.27,11.93.43,17.89.12,4.49-2.32,6.14-7.31,6-7.64-.27-15.3-.07-22.95-.07Zm-21.4-20.45c0,3.29.19,5.89,0,8.46-.32,3.4,1.82,4.31,4.94,4.29,11.39-.06,22.77-.13,34.15-.36,1.23,0,3.15-.92,3.53-1.83,3.13-7.51.43-10.74-8.53-10.57-2.55.05-5.11,0-7.66,0Z" className="fill-black"/>
          <path d="M304.31,153.47v12.44c2.59.22,5,.62,7.47.61,8.24,0,16.5-.45,24.71-.1,2.25.1,4.37,2.41,6.55,3.7-1.89,1.35-3.75,3.84-5.68,3.88-12.54.29-25.1.15-37.65-.2-1.39,0-3.81-2.23-3.87-3.49a155.85,155.85,0,0,1,.33-20.5c.12-1.34,3.28-3.45,5.12-3.52,11.75-.48,23.53-.52,35.3-.65,3.15,0,6.61.63,5.9,4.09-.31,1.51-3.73,3.5-5.81,3.57C326.14,153.66,315.57,153.47,304.31,153.47Z" className="fill-black"/>
          <path d="M304.48,246.2v15h20.4c3.34,0,6.81-.46,10,.22,1.89.41,3.3,2.62,4.92,4-1.59,1.25-3.12,3.48-4.79,3.57-7.63.41-15.3.31-23,.22-18-.2-16.53,2.45-16.53-15q0-5.52,0-11.06c0-3.48,1.89-5,5.86-5,11,.11,22-.13,33,.2,1.86.06,3.64,2.28,5.46,3.5-1.79,1.45-3.51,4.07-5.38,4.15C324.67,246.42,314.88,246.2,304.48,246.2Z" className="fill-black"/>
          <path d="M172.1,211.22q0,42.74,0,85.46c0,9.77-4.39,13.64-15.43,13.67q-21.22,0-42.46,0c-9.24,0-14.06-4.38-14.06-12.72q0-87.06,0-174.13c0-7.43,3.94-11.09,12.22-11.15q23.6-.18,47.19,0c9.13.08,12.56,3.44,12.56,11.84Q172.12,167.69,172.1,211.22Zm-63-.39q0,21.63,0,43.25c0,14.42,0,28.83,0,43.25,0,3.57,1,5.41,5.76,5.31,13.55-.29,27.11-.11,40.67-.15,7.2,0,7.82-.52,7.82-6.85q0-84.9.09-169.81c0-4.4-1.57-5.81-6.42-5.73-13.56.21-27.12.26-40.67-.06-5.54-.13-7.44,1.18-7.39,6.41C109.2,154.58,109.05,182.71,109.05,210.83Z" className="fill-black"/>
        </svg>
      )
    case "panel":
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <rect x="3" y="6" width="18" height="12" rx="2" className="fill-[#D7514C]/20 stroke-[#D7514C]" />
          <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" className="stroke-gray-700" />
        </svg>
      )
    case "carteleras":
      return (
        <svg {...iconProps} viewBox="0 0 400.58 425.8">
          <polygon points="120.37 134.18 120.37 295.23 128.23 298.39 266.32 298.39 269.7 294.32 271.51 136.74 238.91 130.67 132.12 130.67 120.37 134.18" className="fill-[#e94446]"/>
          <g>
            <path d="M129.25,132l-8.88,2.16V295.23c3.17.83,7.42,2.89,11.69,2.92,42.41.24,84.81.05,127.22.24,7,0,10.46-1.33,10.42-8.54-.25-50.64-.13-101.29-.15-151.93,0-1.14-.19-2.28-.35-4.06-3.31-.37-6.14-.94-9-1q-51-.51-102-.87c-9.35-.07-18.71,0-28.06,0" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M72.19,329.53h247" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M308.85,101.62c-3.11-.28-6.27-1-9.34-.77-20.6,1.61-41.25-1.43-61.72.18-17.89,1.42-35.63-2-53.33-.13-19.09,2-38.06-1.38-57.07-.09-4.42.3-8.8,1-14.5,1.63-12.35-3.77-26.68-.64-40.7-1.66" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M275.18,309.27c-17.45,1.33-35.29-2.41-50.89,2.35-36.56-5.39-72,.91-108.72-2.83-.83,7.13-1.52,13.09-2.22,19" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M114.29,104.16v15c3.67.41,6.51,1,9.35,1,32.74-.21,65.48-.65,98.22-.74,15.9,0,31.8.51,47.71.78,8.55.15,14.84,5,14.85,12.66,0,18.86-.69,37.71-.76,56.56,0,11.81.82,23.63.81,35.45,0,13.22-.63,26.45-.85,39.67-.13,8.72-.1,17.45,0,26.17.05,3.92.5,7.84.74,11.37l-8.05,6.24c.65,7.69,1.15,13.61,1.66,19.53" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M115.22,119.35c-9.3,5.89-10.3,14-9.67,23.65.73,11.18-1.45,22.49-1.42,33.75.05,13.22,1.33,26.44,1.67,39.67.31,11.82.07,23.64.07,36.29H70.32" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M87.16,128.63l-.93,22" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M104,252.71q.47,17.73.93,35.46c.21,8.79.15,17.66,10.29,22.79" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M304.18,128.63v21.11" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M304.18,229.92v20.26" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M86.23,229.92v20.26" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M86.23,280.57l.93,20.26" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M86.23,179.28v20.26" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M304.18,179.28v21.78l-17.78,1" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M304.18,280.57v20.26" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M321,127l-36.49.84" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M284.53,301.67c9.36.28,18.71.52,28.07.88,2.19.08,4.36.53,6.54.81" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M319.14,151.42H286.4" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M319.14,252.71H286.4" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M321,177.59H286.4" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M168.54,311.8v16" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M277.05,104.16l-.93,16" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M72.19,303.36c7.49-.28,15-.52,22.45-.86,3.44-.16,6.86-.55,10.29-.83" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M321,227.39l-34.62.85" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M321,278l-34.62.84" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M104.93,127.79,72.19,127" className="fill-none stroke-black stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M72.19,202.07l30.87-.84" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M70.32,227.39l32.74.85" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M70.32,176.75l32.74.84" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M103.06,151.42H72.19" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M222.8,313.49v14.35" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M168.54,104.16v14.35" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M70.32,278l32.74.84" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M304.18,200.38l15,1.69" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
          </g>
        </svg>
      )
    case "muro":
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <rect x="2" y="4" width="20" height="16" rx="1" className="fill-[#D7514C]/20 stroke-[#D7514C]" />
          <path d="M2 8h20M2 12h20M2 16h20" className="stroke-[#D7514C]" />
        </svg>
      )
    case "murales":
      return (
        <svg {...iconProps} viewBox="0 0 400.58 425.8">
          <polygon points="115.99 147.2 115.99 266.07 186.83 259.42 187.99 253.26 187.99 111.7 185.4 107.44 117.37 138.96 115.99 147.2" className="fill-[#e94446]"/>
          <g>
            <path d="M188,106.4c.83,2.79,2.38,5.58,2.38,8.37q.23,70.14,0,140.29c0,2.79-1.55,5.58-2.38,8.37" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M204.2,107.44c17.46,8.73,34.42,18.33,52.64,25.74,7,2.85,8.48,5.68,8.48,10.91q0,57.57,0,115.16V276L294,282v49.46" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M189.23,90.69V104.3c-24.69,10.91-48,20.92-70.9,31.69-3,1.44-4.92,6.69-5,10.19-.35,37.69-.21,75.38-.21,113.07v71.18" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M100.68,215.28C91,218.39,87.42,214.37,87,206.9c-.17-3.14,0-6.3,0-10.48l-19.72-1.91L64.52,180.2H53.29c0,15.17.16,29.84-.13,44.5-.06,3.1,3.07,8.21-4.86,8.37" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M340.14,233.07l-10.9-.42c-1-5.24-1.91-10-2.9-15.19l-15.51-2.39V187.53H290.88v27.75h-13.1" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M115.65,136.76c-4.46-7.55-3.51-13.35,6.16-17.91,17.72-8.34,34.78-17.66,52.54-25.93,9.49-4.42,19.37-5.8,30-.29,16.6,8.62,34,16.22,51,24.23,11.31,5.31,12.07,7.08,7.48,17.8" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M116.9,268.67c19.54-2.1,39.06-4.28,58.62-6.22,4.45-.44,9-.06,15-.06v68" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M257.83,330.43c0-2.09,0-4.18,0-6.28-.1-11.5-.1-11.5-13.72-11.51H231.86c-1,6.89-1.85,12.87-2.72,18.84" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M261.57,268.67c-17.46-1.75-34.92-3.52-52.39-5.18-1.18-.11-2.49.64-3.73,1" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M327.67,333.58c-23.28-.7-46.56-1.86-69.84-1.95-17.46-.06-34.92,1.72-52.38,1.83-22.45.13-44.9-.58-67.35-.93" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
            <path d="M125.63,332.53H78.23" className="fill-none stroke-black stroke-linecap-round stroke-linejoin-round" strokeWidth="12"/>
          </g>
          <path d="M208.79,137.59a3.75,3.75,0,1,0-3.75-3.75,3.79,3.79,0,0,0,3.75,3.75Z" className="fill-black"/>
          <path d="M232.31,147.21a3.75,3.75,0,1,0-3.75-3.75,3.79,3.79,0,0,0,3.75,3.75Z" className="fill-black"/>
          <path d="M251.55,155.23a3.75,3.75,0,1,0-3.75-3.75,3.79,3.79,0,0,0,3.75,3.75Z" className="fill-black"/>
          <path d="M207.72,163.79A3.75,3.75,0,1,0,204,160a3.8,3.8,0,0,0,3.75,3.75Z" className="fill-black"/>
          <path d="M207.72,189.45A3.75,3.75,0,1,0,204,185.7a3.8,3.8,0,0,0,3.75,3.75Z" className="fill-black"/>
          <path d="M207.72,210.83a3.75,3.75,0,1,0-3.75-3.75,3.79,3.79,0,0,0,3.75,3.75Z" className="fill-black"/>
          <path d="M206.65,236.49a3.75,3.75,0,1,0-3.75-3.75,3.79,3.79,0,0,0,3.75,3.75Z" className="fill-black"/>
          <path d="M229.63,170.2a3.75,3.75,0,1,0-3.75-3.75,3.82,3.82,0,0,0,3.75,3.75Z" className="fill-black"/>
          <path d="M229.63,192.65a3.75,3.75,0,1,0-3.75-3.75,3.82,3.82,0,0,0,3.75,3.75Z" className="fill-black"/>
          <path d="M228,214.57a3.75,3.75,0,1,0-3.75-3.75,3.79,3.79,0,0,0,3.75,3.75Z" className="fill-black"/>
          <path d="M228.57,240.77a3.75,3.75,0,1,0-3.75-3.75,3.8,3.8,0,0,0,3.75,3.75Z" className="fill-black"/>
          <path d="M250,176.62a3.75,3.75,0,1,0-3.75-3.75,3.8,3.8,0,0,0,3.75,3.75Z" className="fill-black"/>
          <path d="M249.41,196.93a3.75,3.75,0,1,0-3.75-3.75,3.82,3.82,0,0,0,3.75,3.75Z" className="fill-black"/>
          <path d="M248.88,219.38a3.75,3.75,0,1,0-3.75-3.75,3.79,3.79,0,0,0,3.75,3.75Z" className="fill-black"/>
          <path d="M250,246.11a3.75,3.75,0,1,0-3.75-3.75,3.79,3.79,0,0,0,3.75,3.75Z" className="fill-black"/>
          <polyline points="113.37 146.18 113.09 268.67 190.49 258.96" className="fill-none"/>
        </svg>
      )
    case "edificio":
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <rect x="4" y="2" width="16" height="20" rx="1" className="fill-[#D7514C]/20 stroke-[#D7514C]" />
          <rect x="8" y="6" width="2" height="2" className="fill-[#D7514C]" />
          <rect x="14" y="6" width="2" height="2" className="fill-[#D7514C]" />
          <rect x="8" y="10" width="2" height="2" className="fill-[#D7514C]" />
          <rect x="14" y="10" width="2" height="2" className="fill-[#D7514C]" />
          <rect x="11" y="16" width="2" height="6" className="stroke-gray-700" />
        </svg>
      )
    default:
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" className="fill-[#D7514C]/20 stroke-[#D7514C]" />
        </svg>
      )
  }
}

const categories = [
  { id: "valla", name: "Vallas", icon: "valla" },
  { id: "pantalla", name: "Pantallas", icon: "pantalla" },
  { id: "mupis", name: "Mupis", icon: "mupis" },
  { id: "displays", name: "Displays", icon: "displays" },
  { id: "parada-bus", name: "Parada de Bus", icon: "parada-bus" },
  { id: "letreros", name: "Letreros", icon: "letreros" },
  { id: "carteleras", name: "Carteleras", icon: "carteleras" },
  { id: "murales", name: "Murales", icon: "murales" },
]

// Featured advertising spaces data
const featuredSpaces = [
  {
    id: "valla-centrica",
    image: "/placeholder.svg?height=200&width=300",
    type: "VALLA",
    name: "Valla en zona céntrica",
    location: "La Paz, Bolivia",
    dimensions: "10×4 m",
    dailyImpacts: "44.000",
    city: "La Paz",
    country: "Bolivia",
    adType: "Bipolar",
    illumination: "Sí",
    price: 850,
    rating: 4.8,
    reviews: 12,
  },
  {
    id: "pantalla-led-premium",
    image: "/placeholder.svg?height=200&width=300",
    type: "LED",
    name: "Pantalla LED premium",
    location: "Santa Cruz, Bolivia",
    dimensions: "8×6 m",
    dailyImpacts: "65.000",
    city: "Santa Cruz",
    country: "Bolivia",
    adType: "Digital",
    illumination: "Sí",
    price: 1200,
    rating: 4.9,
    reviews: 8,
  },
  {
    id: "mupi-avenida",
    image: "/placeholder.svg?height=200&width=300",
    type: "MUPI",
    name: "MUPI en avenida principal",
    location: "Cochabamba, Bolivia",
    dimensions: "1.2×1.8 m",
    dailyImpacts: "28.000",
    city: "Cochabamba",
    country: "Bolivia",
    adType: "Unipolar",
    illumination: "Sí",
    price: 450,
    rating: 4.6,
    reviews: 15,
  },
  {
    id: "pantalla-autopista",
    image: "/placeholder.svg?height=200&width=300",
    type: "PANTALLA DIGITAL",
    name: "Pantalla autopista norte",
    location: "La Paz, Bolivia",
    dimensions: "12×8 m",
    dailyImpacts: "95.000",
    city: "La Paz",
    country: "Bolivia",
    adType: "Digital",
    illumination: "Sí",
    price: 1800,
    rating: 5.0,
    reviews: 6,
  },
  {
    id: "totem-centro-comercial",
    image: "/placeholder.svg?height=200&width=300",
    type: "TOTEM",
    name: "Totem centro comercial",
    location: "Santa Cruz, Bolivia",
    dimensions: "2×4 m",
    dailyImpacts: "35.000",
    city: "Santa Cruz",
    country: "Bolivia",
    adType: "Unipolar",
    illumination: "No",
    price: 650,
    rating: 4.7,
    reviews: 9,
  },
]

export default function StellarMotionPage() {
  const router = useRouter()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const carouselRef = useRef<HTMLDivElement>(null)
  const featuredCarouselRef = useRef<HTMLDivElement>(null)

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth * 0.8
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const scrollFeaturedCarousel = (direction: "left" | "right") => {
    if (featuredCarouselRef.current) {
      const scrollAmount = featuredCarouselRef.current.clientWidth * 0.8
      featuredCarouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  // Fetch categorías
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {isUserMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} aria-hidden="true" />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-2">
        {/* Search Section */}
        <div className="mb-16">
          <SearchBar />
        </div>

        {/* Categories Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <div className="inline-block">
              <div className="w-12 h-1 bg-[#D7514C] mx-auto mb-4"></div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Categorías</h2>
              <p className="text-gray-600">Explora las categorías mas populares.</p>
            </div>
          </div>

          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={() => scrollCarousel("left")}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Categorías anteriores"
              aria-controls="categories-carousel"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            {/* Categories Carousel */}
            <div
              ref={carouselRef}
              id="categories-carousel"
              className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory px-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {loading ? (
              // Loading skeleton
              [...Array(8)].map((_, i) => (
                <div key={i} className="flex-shrink-0 snap-start w-24 text-center">
                  <div className="w-20 h-20 mx-auto mb-3 bg-gray-200 rounded-2xl animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))
            ) : (
              categories.map((category) => (
                <div 
                  key={category.slug} 
                  className="flex-shrink-0 snap-start w-24 text-center group cursor-pointer"
                  onClick={() => router.push(`/search?category=${category.slug}`)}
                >
                  <div className="w-20 h-20 mx-auto mb-3 flex items-center justify-center rounded-2xl bg-white shadow-sm group-hover:shadow-md transition-shadow border border-gray-100">
                    <CategoryIcon type={category.iconKey} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{category.label}</span>
                </div>
              ))
            )}
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => scrollCarousel("right")}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Siguientes categorías"
              aria-controls="categories-carousel"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <div className="inline-block">
              <div className="w-12 h-1 bg-[#D7514C] mx-auto mb-4"></div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Cómo funciona</h2>
              <p className="text-gray-600">Descubre cómo StellarMotion simplifica la publicidad exterior</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Encuentra rápido */}
            <div className="text-center p-8 bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Encuentra rápido</h3>
              <p className="text-gray-600 leading-relaxed">
                Localiza soportes publicitarios en tu zona con búsquedas inteligentes
              </p>
            </div>

            {/* Reserva fácil */}
            <div className="text-center p-8 bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Reserva fácil</h3>
              <p className="text-gray-600 leading-relaxed">
                Gestiona tus reservas de soportes de forma sencilla y rápida
              </p>
            </div>

            {/* Gana dinero */}
            <div className="text-center p-8 bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Gana dinero</h3>
              <p className="text-gray-600 leading-relaxed">
                Publica tus soportes y genera ingresos extra
              </p>
            </div>
          </div>
        </section>

        {/* Featured Spaces Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <div className="inline-block">
              <div className="w-12 h-1 bg-[#D7514C] mx-auto mb-4"></div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Espacios destacados</h2>
              <p className="text-gray-600">
                Consulta nuestros soportes publicitarios más valorados y con mayor alcance.
              </p>
            </div>
          </div>

          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={() => scrollFeaturedCarousel("left")}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Espacios anteriores"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            {/* Featured Spaces Carousel */}
            <div
              ref={featuredCarouselRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory px-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {featuredSpaces.map((space) => (
                <Link
                  key={space.id}
                  href={`/product/${space.id}`}
                  className="flex-shrink-0 snap-start w-80 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:border-[#D7514C] border border-transparent overflow-hidden group cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative">
                    <img
                      src={space.image || "/placeholder.svg"}
                      alt={space.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-[#D7514C] text-white text-xs font-medium px-2 py-1 rounded-full">
                        {space.type}
                      </span>
                    </div>
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                      <Heart className="w-4 h-4 text-gray-600 hover:text-[#D7514C]" />
                    </button>
                    <div className="absolute bottom-3 right-3 flex items-center space-x-1 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      <span className="text-yellow-400">★</span>
                      <span>{space.rating}</span>
                      <span>({space.reviews})</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 mb-1 text-lg">{space.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {space.location}
                    </p>

                    {/* Specifications Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
                      <div className="flex items-center space-x-2">
                        <Ruler className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Dimensión:</span>
                        <span className="font-medium">{space.dimensions}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Impactos diarios:</span>
                        <span className="font-medium">{space.dailyImpacts}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Ciudad:</span>
                        <span className="font-medium">{space.city}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">País:</span>
                        <span className="font-medium">{space.country}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-[#D7514C] rounded-sm flex items-center justify-center">
                          <span className="text-white text-xs font-bold">T</span>
                        </div>
                        <span className="text-gray-600">Tipo:</span>
                        <span className="font-medium">{space.adType}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Lightbulb className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Iluminación:</span>
                        <span className="font-medium">{space.illumination}</span>
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-green-600">${space.price}</span>
                        <span className="text-gray-600 text-sm"> / mes</span>
                      </div>
                      <div className="px-4 py-2 rounded-lg text-sm bg-[#D7514C] text-white font-medium">
                        Ver detalles
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => scrollFeaturedCarousel("right")}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Siguientes espacios"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </section>

        {/* Partners Section */}
        <PartnersSection />
      </main>
    </div>
  )
}
