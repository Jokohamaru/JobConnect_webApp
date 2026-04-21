"use client";

import { useState } from "react";
import { CVUpload } from "./CV-Upload";
import { BasicInfo } from "./Basic-Info";
import { GeneralInfo } from "./General-Info";
import { CoverLetter } from "./Cover-Letter";


export function CVProfile() {
  return (
    <div className="mx-auto px-6 space-y-4">
      <CVUpload />
      <BasicInfo />
      <GeneralInfo />
      <CoverLetter />
    </div>
  );
}