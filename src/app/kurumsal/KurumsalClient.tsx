"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";
import { Building2, Target, Leaf, Users } from "lucide-react";

export default function KurumsalClient() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out-cubic",
    });
  }, []);

  const sections = [
    {
      title: "HakkÄ±mÄ±zda",
      description:
        "Cemre Park olarak yÄ±llardÄ±r kaliteyi ve ÅŸÄ±klÄ±ÄŸÄ± sizlerle buluÅŸturuyoruz.",
      icon: <Building2 className="w-12 h-12 mb-4 text-pink-600" />,
      link: "/kurumsal/hakkimizda",
      delay: 100,
    },
    {
      title: "Vizyon & Misyon",
      description:
        "YenilikÃ§i tasarÄ±mlarÄ±mÄ±zla tesettÃ¼r giyiminde Ã¶ncÃ¼ bir marka olmayÄ± hedefliyoruz.",
      icon: <Target className="w-12 h-12 mb-4 text-pink-600" />,
      link: "/kurumsal/vizyon-misyon",
      delay: 200,
    },
    {
      title: "SÃ¼rdÃ¼rÃ¼lebilirlik",
      description: "DoÄŸaya ve insana saygÄ±lÄ±, Ã§evre dostu Ã¼retim sÃ¼reÃ§lerini benimsiyoruz.",
      icon: <Leaf className="w-12 h-12 mb-4 text-pink-600" />,
      link: "/kurumsal/surdurulebilirlik",
      delay: 300,
    },
    {
      title: "Kariyer",
      description:
        "BÃ¼yÃ¼yen ailemize katÄ±lmak ve kariyerinizde yeni bir sayfa aÃ§mak ister misiniz?",
      icon: <Users className="w-12 h-12 mb-4 text-pink-600" />,
      link: "/kurumsal/kariyer",
      delay: 400,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      {/* Hero Section */}
      <div className="container mx-auto px-4 mb-16 text-center">
        <h1
          data-aos="fade-down"
          className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight"
        >
          Cemre Park <span className="text-pink-600">Kurumsal</span>
        </h1>
        <p
          data-aos="fade-up"
          data-aos-delay="100"
          className="text-lg text-gray-600 max-w-2xl mx-auto"
        >
          Bizimle ilgili daha fazla bilgi edinin, deÄŸerlerimizi keÅŸfedin ve geleceÄŸi birlikte
          ÅŸekillendirelim.
        </p>
      </div>

      {/* Grid Cards Section */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {sections.map((section, index) => (
            <Link key={index} href={section.link}>
              <div
                data-aos="zoom-in-up"
                data-aos-delay={section.delay}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 flex flex-col items-center text-center h-full group"
              >
                <div className="transform group-hover:scale-110 transition-transform duration-300">
                  {section.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-pink-600 transition-colors">
                  {section.title}
                </h3>
                <p className="text-gray-600">{section.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Timeline or Values Section (Placeholder) */}
      <div className="container mx-auto px-4 mt-24">
        <div
          data-aos="fade-up"
          className="bg-white rounded-3xl p-12 shadow-lg border border-gray-100"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Kalite ve GÃ¼venin Adresi</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                MÃ¼ÅŸteri memnuniyetini her zaman Ã¶n planda tutarak, en kaliteli kumaÅŸlarÄ± modern
                tasarÄ±mlarla harmanlÄ±yoruz. SektÃ¶rdeki deneyimimizle, her adÄ±mda mÃ¼kemmelliÄŸi
                hedefliyoruz.
              </p>
              <ul className="space-y-4">
                {["MÃ¼ÅŸteri OdaklÄ±lÄ±k", "YenilikÃ§i YaklaÅŸÄ±m", "GÃ¼venilirlik"].map(
                  (item, i) => (
                    <li key={i} className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-pink-600 rounded-full mr-3"></span>
                      <span className="font-medium">{item}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-inner bg-gray-200">
              {/* Optional background image or pattern */}
              <div className="absolute inset-0 bg-gradient-to-tr from-pink-600/20 to-transparent flex items-center justify-center">
                <Target className="w-32 h-32 text-pink-600 opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
