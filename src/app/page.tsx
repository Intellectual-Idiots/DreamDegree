'use client';

import { useTranslation } from "@/utils/translate";

export default function Home() {
  const { t } = useTranslation();

  return <h1>{t("hi")}</h1>;
}
