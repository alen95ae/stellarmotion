"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import ScrumBoard from "@/components/projects/ScrumBoard";

export default function ProyectosPage() {
    return (
        <Sidebar>
            <div className="h-screen w-full bg-slate-50 overflow-hidden p-4">
                <ScrumBoard />
            </div>
        </Sidebar>
    );
}
