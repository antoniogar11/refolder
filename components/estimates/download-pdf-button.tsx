"use client";

import { FileDown } from "lucide-react";
import { generateEstimatePDF } from "@/lib/pdf/generate-estimate-pdf";
import { buildEstimatePDFData } from "@/lib/pdf/build-estimate-pdf-data";
import type { Estimate, EstimateItem, Company } from "@/types";

type DownloadPDFButtonProps = {
  estimate: Estimate;
  items: EstimateItem[];
  company: Company | null;
};

export function DownloadPDFButton({ estimate, items, company }: DownloadPDFButtonProps) {
  function handleDownload() {
    generateEstimatePDF(buildEstimatePDFData(estimate, items, company));
  }

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
    >
      <FileDown className="h-4 w-4" />
      Descargar PDF
    </button>
  );
}
