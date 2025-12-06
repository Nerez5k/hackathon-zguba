"use client";

import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button, ProgressBar } from "@/components/ui";
import {
  Step0Photo,
  Step1Category,
  Step2Description,
  Step3Location,
  Step4Office,
  Step5Summary,
} from "@/components/wizard";
import { stepSchemas, type StepNumber } from "@/lib/schema";
import {
  type RzeczZnalezionaForm,
  type RzeczZnaleziona,
  defaultFormData,
  Status,
  WIZARD_STEPS,
  PHOTO_STEP,
} from "@/lib/types";

const LOCAL_STORAGE_KEY = "kreator-form-draft";

interface WizardProps {
  onSubmit: (data: RzeczZnaleziona) => Promise<void>;
}

interface FormErrors {
  kategoria?: string;
  nazwa_przedmiotu?: string;
  opis?: string;
  data_znalezienia?: string;
  lokalizacja?: {
    opis?: string;
    lat?: string;
    lng?: string;
  };
  urzad?: {
    nazwa?: string;
    email?: string;
    telefon?: string;
    adres_odbioru?: string;
  };
  submit?: string;
}

export default function Wizard({ onSubmit }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<RzeczZnalezionaForm>(defaultFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [createdItemId, setCreatedItemId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const savedFormData = parsed.formData;
        
        if (savedFormData && savedFormData.kategoria) {
          setFormData(savedFormData);
          if (parsed.currentStep > 0) {
            setCurrentStep(parsed.currentStep);
          }
        }
      } catch (e) {
        console.error("Failed to load draft:", e);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (!submitSuccess && currentStep > 0) {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ formData, currentStep })
      );
    }
  }, [formData, currentStep, submitSuccess]);

  const handleChange = useCallback((updates: Partial<RzeczZnalezionaForm>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setErrors({});
  }, []);

  const validateStep = (step: StepNumber): boolean => {
    const schema = stepSchemas[step];
    const result = schema.safeParse(formData);

    if (!result.success) {
      const formattedErrors: FormErrors = {};
      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        if (path.includes(".")) {
          const [parent, child] = path.split(".");
          if (parent === "lokalizacja") {
            if (!formattedErrors.lokalizacja) formattedErrors.lokalizacja = {};
            (formattedErrors.lokalizacja as Record<string, string>)[child] = err.message;
          } else if (parent === "urzad") {
            if (!formattedErrors.urzad) formattedErrors.urzad = {};
            (formattedErrors.urzad as Record<string, string>)[child] = err.message;
          }
        } else {
          (formattedErrors as Record<string, string>)[path] = err.message;
        }
      });
      setErrors(formattedErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (currentStep === 0) {
      setCurrentStep(1);
      return;
    }

    if (validateStep(currentStep as StepNumber)) {
      setCurrentStep((prev) => Math.min(prev + 1, WIZARD_STEPS.length));
    }
  };

  const handleBack = () => {
    if (currentStep === 1) return;
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setErrors({});
  };

  const handlePhotoAnalyzed = (data: Partial<RzeczZnalezionaForm> & { zdjecie_base64?: string }) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
    setCurrentStep(1);
  };

  const handlePhotoSkip = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setIsSubmitting(true);

    try {
      const now = new Date().toISOString();
      const itemId = uuidv4();
      const rzeczZnaleziona: RzeczZnaleziona = {
        id: itemId,
        kategoria: formData.kategoria!,
        nazwa_przedmiotu: formData.nazwa_przedmiotu,
        opis: formData.opis,
        data_znalezienia: formData.data_znalezienia,
        status: Status.DO_ODBIORU,
        lokalizacja: {
          opis: formData.lokalizacja.opis!,
          lat: formData.lokalizacja.lat!,
          lng: formData.lokalizacja.lng!,
          gmina_teryt: formData.lokalizacja.gmina_teryt,
          gmina_nazwa: formData.lokalizacja.gmina_nazwa,
          powiat: formData.lokalizacja.powiat,
          wojewodztwo: formData.lokalizacja.wojewodztwo,
        },
        urzad: {
          nazwa: formData.urzad.nazwa!,
          email: formData.urzad.email!,
          telefon: formData.urzad.telefon!,
          adres_odbioru: formData.urzad.adres_odbioru!,
        },
        data_wpisu: now,
        data_modyfikacji: now,
      };

      await onSubmit(rzeczZnaleziona);

      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setCreatedItemId(itemId);
      setSubmitSuccess(true);
    } catch (error) {
      console.error("Submit failed:", error);
      setErrors({ submit: "Wystąpił błąd podczas zapisywania. Spróbuj ponownie." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(defaultFormData);
    setCurrentStep(0);
    setErrors({});
    setSubmitSuccess(false);
    setCreatedItemId(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const handleExportItem = async (format: "json" | "csv" | "xml") => {
    if (!createdItemId) return;
    
    try {
      const response = await fetch(`/api/export?format=${format}&id=${createdItemId}`);
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rzecz-${createdItemId.slice(0, 8)}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="bg-white border-t-4 border-t-gov-success p-8 shadow-sm">
          <div className="text-center">
            <div className="w-16 h-16 bg-gov-success-light rounded-none flex items-center justify-center mx-auto mb-4 border border-gov-success">
              <svg
                className="w-8 h-8 text-gov-success"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gov-black mb-2">
              Rzecz została opublikowana!
            </h2>
            <p className="text-gov-text mb-6">
              Informacja o znalezionym przedmiocie została zapisana w systemie rejestru centralnego.
            </p>
          </div>

          <div className="border-t border-gov-border pt-6 mt-6">
            <p className="text-sm font-bold text-gov-black mb-3 text-center">
              Eksportuj ten wpis:
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => handleExportItem("json")}
                className="px-4 py-2 text-sm border border-gov-border hover:border-gov-blue hover:bg-gov-blue-light transition-colors"
              >
                JSON
              </button>
              <button
                onClick={() => handleExportItem("csv")}
                className="px-4 py-2 text-sm border border-gov-border hover:border-gov-blue hover:bg-gov-blue-light transition-colors"
              >
                CSV
              </button>
              <button
                onClick={() => handleExportItem("xml")}
                className="px-4 py-2 text-sm border border-gov-border hover:border-gov-blue hover:bg-gov-blue-light transition-colors"
              >
                XML
              </button>
            </div>
          </div>

          <div className="flex justify-center gap-4 flex-col sm:flex-row mt-8">
            <Button variant="primary" onClick={handleReset} className="font-bold">
              Dodaj kolejny przedmiot
            </Button>
            <Button variant="outline" onClick={() => window.location.href = "/lista"}>
              Przejdź do listy rzeczy
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="w-full mb-8 bg-white border border-gov-border p-4 shadow-sm">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-baseline">
              <h2 className="text-lg font-bold text-gov-blue">
                {PHOTO_STEP.name}
              </h2>
              <span className="text-sm text-gov-text font-bold">
                Krok opcjonalny
              </span>
            </div>
            <p className="text-sm text-gov-text-light">
              {PHOTO_STEP.description}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gov-border p-6 md:p-8 shadow-sm">
          <Step0Photo
            onAnalyzed={handlePhotoAnalyzed}
            onSkip={handlePhotoSkip}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ProgressBar currentStep={currentStep} />

      <div className="bg-white border border-gov-border p-6 md:p-8 shadow-sm mb-8">
        {currentStep === 1 && (
          <Step1Category
            data={formData}
            onChange={handleChange}
            error={errors.kategoria}
          />
        )}
        {currentStep === 2 && (
          <Step2Description
            data={formData}
            onChange={handleChange}
            errors={errors}
          />
        )}
        {currentStep === 3 && (
          <Step3Location
            data={formData}
            onChange={handleChange}
            errors={errors}
          />
        )}
        {currentStep === 4 && (
          <Step4Office
            data={formData}
            onChange={handleChange}
            errors={errors}
          />
        )}
        {currentStep === 5 && <Step5Summary data={formData} />}

        {errors.submit ? (
          <div className="mt-6 p-4 bg-gov-error-light border-l-4 border-gov-error">
            <p className="text-gov-error font-bold">Błąd publikacji:</p>
            <p className="text-gov-text text-sm">{errors.submit}</p>
          </div>
        ) : null}
      </div>

      <div className="flex justify-between items-center bg-gov-gray-light p-4 border border-gov-border">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="bg-white"
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          }
        >
          Wstecz
        </Button>

        <div className="text-xs text-gov-text-light font-medium uppercase tracking-wider hidden sm:block">
          {WIZARD_STEPS[currentStep - 1]?.name}
        </div>

        {currentStep < WIZARD_STEPS.length ? (
          <Button
            variant="primary"
            onClick={handleNext}
            className="font-bold"
            rightIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            }
          >
            Dalej
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            className="font-bold bg-gov-success hover:bg-green-800 border-transparent"
            leftIcon={
              !isSubmitting && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )
            }
          >
            {isSubmitting ? "Publikowanie..." : "Zatwierdź i opublikuj"}
          </Button>
        )}
      </div>

      <p className="text-center text-xs text-gov-text-light mt-4 font-medium">
        System automatycznie zapisuje postępy prac.
      </p>
    </div>
  );
}
