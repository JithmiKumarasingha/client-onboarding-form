'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { onboardingSchema, OnboardingFormData } from '@/lib/validationSchema';

const SERVICES = ['UI/UX', 'Branding', 'Web Dev', 'Mobile App'];

export default function OnboardingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedData, setSubmittedData] = useState<OnboardingFormData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: '',
      email: '',
      companyName: '',
      services: [],
      budgetUsd: undefined,
      projectStartDate: '',
      acceptTerms: false,
    },
  });

  const watchedServices = watch('services');

  // Handle pre-filling from query params (bonus feature)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    
    if (serviceParam && SERVICES.includes(serviceParam)) {
      setValue('services', [serviceParam]);
    }
  }, [setValue]);

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Convert budget to number if provided
      const submitData = {
        ...data,
        budgetUsd: data.budgetUsd === '' ? undefined : Number(data.budgetUsd),
      };

      const response = await fetch(process.env.NEXT_PUBLIC_ONBOARD_URL || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setSubmittedData(submitData);
      } else {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleServiceChange = (service: string, checked: boolean) => {
    const currentServices = watchedServices || [];
    if (checked) {
      setValue('services', [...currentServices, service]);
    } else {
      setValue('services', currentServices.filter(s => s !== service));
    }
  };

  if (submitStatus === 'success' && submittedData) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-800 mb-4">
            🎉 Application Submitted Successfully!
          </h2>
          <div className="space-y-2 text-sm text-green-700">
            <p><strong>Name:</strong> {submittedData.fullName}</p>
            <p><strong>Email:</strong> {submittedData.email}</p>
            <p><strong>Company:</strong> {submittedData.companyName}</p>
            <p><strong>Services:</strong> {submittedData.services.join(', ')}</p>
            {submittedData.budgetUsd && (
              <p><strong>Budget:</strong> ${submittedData.budgetUsd.toLocaleString()}</p>
            )}
            <p><strong>Start Date:</strong> {submittedData.projectStartDate}</p>
          </div>
          <button
            onClick={() => {
              setSubmitStatus('idle');
              setSubmittedData(null);
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Client Onboarding Form</h1>
      
      {submitStatus === 'error' && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            <strong>Error:</strong> {errorMessage}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            id="fullName"
            type="text"
            {...register('fullName')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your full name"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email address"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Company Name */}
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
            Company Name *
          </label>
          <input
            id="companyName"
            type="text"
            {...register('companyName')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your company name"
          />
          {errors.companyName && (
            <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
          )}
        </div>

        {/* Services */}
        <div>
          <fieldset>
            <legend className="text-sm font-medium text-gray-700 mb-3">
              Services Interested In *
            </legend>
            <div className="space-y-2">
              {SERVICES.map((service) => (
                <div key={service} className="flex items-center">
                  <input
                    id={service}
                    type="checkbox"
                    checked={watchedServices?.includes(service) || false}
                    onChange={(e) => handleServiceChange(service, e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor={service} className="ml-3 text-sm text-gray-700">
                    {service}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
          {errors.services && (
            <p className="mt-1 text-sm text-red-600">{errors.services.message}</p>
          )}
        </div>

        {/* Budget */}
        <div>
          <label htmlFor="budgetUsd" className="block text-sm font-medium text-gray-700 mb-1">
            Budget (USD)
          </label>
          <input
            id="budgetUsd"
            type="number"
            min="100"
            max="1000000"
            {...register('budgetUsd', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your budget (optional)"
          />
          {errors.budgetUsd && (
            <p className="mt-1 text-sm text-red-600">{errors.budgetUsd.message}</p>
          )}
        </div>

        {/* Project Start Date */}
        <div>
          <label htmlFor="projectStartDate" className="block text-sm font-medium text-gray-700 mb-1">
            Project Start Date *
          </label>
          <input
            id="projectStartDate"
            type="date"
            {...register('projectStartDate')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.projectStartDate && (
            <p className="mt-1 text-sm text-red-600">{errors.projectStartDate.message}</p>
          )}
        </div>

        {/* Accept Terms */}
        <div>
          <div className="flex items-start">
            <input
              id="acceptTerms"
              type="checkbox"
              {...register('acceptTerms')}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mt-1"
            />
            <label htmlFor="acceptTerms" className="ml-3 text-sm text-gray-700">
              I accept the terms and conditions *
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="mt-1 text-sm text-red-600">{errors.acceptTerms.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}