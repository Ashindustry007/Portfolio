
"use client";

import { academicData } from "@/lib/config";
import { Footer } from "@/components/footer";
import { ArrowLeft, GraduationCap, Award, BookOpen } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CoursesPage() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Portfolio
          </Link>
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary">
            Academic Foundation
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-8 border-b border-white/5 bg-[#161412]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="space-y-6 max-w-2xl">
            <span className="text-primary font-mono text-xs uppercase tracking-widest block">Education</span>
            <h1 className="text-5xl md:text-7xl font-headline font-bold leading-none uppercase">
              Engineering <br />
              <span className="text-outline text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.8)' }}>
                Foundation
              </span>
            </h1>
            <div className="flex flex-col gap-2 pt-4">
              <p className="text-xl text-white/80 font-headline">{academicData.degree} in {academicData.branch}</p>
              <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">{academicData.university}</p>
            </div>
          </div>

          <div className="flex gap-12 border-l border-white/10 pl-12">
            <div className="space-y-1">
              <span className="text-[10px] text-primary/40 font-mono uppercase tracking-widest block">Cumulative GPA</span>
              <p className="text-4xl font-headline font-bold text-white">{academicData.cgpa}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-primary/40 font-mono uppercase tracking-widest block">Batch</span>
              <p className="text-4xl font-headline font-bold text-white">2019-23</p>
            </div>
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section className="py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {academicData.semesters.map((sem, idx) => (
              <div key={sem.id} className="group flex flex-col gap-6 p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/30 transition-all duration-500">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] text-primary/40 font-mono uppercase tracking-widest block">Semester</span>
                    <h3 className="text-xl font-headline font-bold text-white group-hover:text-primary transition-colors">{sem.id}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-primary/40 font-mono uppercase tracking-widest block">SGPA</span>
                    <p className="text-sm font-mono font-bold text-white/60">{sem.sgpa}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] block border-b border-white/5 pb-2">Key Coursework</span>
                  <ul className="space-y-2">
                    {sem.courses.map((course, cIdx) => (
                      <li key={cIdx} className="text-[11px] text-white/40 leading-relaxed font-medium">
                        {course}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Areas */}
      <section className="py-24 px-8 bg-[#161412] border-t border-white/5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
          <div className="flex gap-6">
            <div className="h-12 w-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <GraduationCap className="text-primary" size={20} />
            </div>
            <div className="space-y-2">
              <h4 className="font-headline font-bold text-white uppercase tracking-wider">AI Specialization</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Early focus on Artificial Intelligence and Machine Learning during undergaduate studies, achieving near-perfect grades in core electives.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="h-12 w-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <BookOpen className="text-primary" size={20} />
            </div>
            <div className="space-y-2">
              <h4 className="font-headline font-bold text-white uppercase tracking-wider">Research Path</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Integrated minor and major projects focusing on hybrid deep learning models and handwritten character recognition.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="h-12 w-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <Award className="text-primary" size={20} />
            </div>
            <div className="space-y-2">
              <h4 className="font-headline font-bold text-white uppercase tracking-wider">Academic Honors</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Consistent top-tier academic standing with multiple semesters exceeding 9.7 SGPA, culminating in a 9.40 CGPA.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
