"""Crisis support button component"""
import React, { useState } from 'react';
import { ExclamationTriangleIcon, PhoneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';

interface CrisisSupportProps {
  className?: string;
}

export const CrisisSupport: React.FC<CrisisSupportProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Crisis Button - Always Visible */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 transition-all ${className}`}
        aria-label="Crisis Support - Get immediate help"
      >
        <ExclamationTriangleIcon className="h-5 w-5" />
        <span className="font-semibold">Need Immediate Help?</span>
      </button>

      {/* Crisis Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="crisis-modal" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={() => setIsOpen(false)}
            ></div>

            {/* Center modal */}
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg font-medium leading-6 text-gray-900" id="crisis-modal">
                      Veterans Crisis Support
                    </h3>
                    <div className="mt-4 space-y-4">
                      <p className="text-sm text-gray-500">
                        If you're a veteran in crisis or concerned about one, help is available 24/7.
                      </p>

                      {/* Veterans Crisis Line */}
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <h4 className="font-semibold text-red-900 mb-2">Veterans Crisis Line</h4>

                        <a
                          href="tel:988"
                          className="flex items-center gap-3 p-3 bg-red-600 hover:bg-red-700 text-white rounded-md mb-2 transition-colors"
                        >
                          <PhoneIcon className="h-5 w-5" />
                          <div>
                            <div className="font-bold">Call: 988 (Press 1)</div>
                            <div className="text-sm">Available 24/7</div>
                          </div>
                        </a>

                        <a
                          href="sms:838255"
                          className="flex items-center gap-3 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md mb-2 transition-colors"
                        >
                          <ChatBubbleLeftRightIcon className="h-5 w-5" />
                          <div>
                            <div className="font-bold">Text: 838255</div>
                            <div className="text-sm">Confidential support via text</div>
                          </div>
                        </a>

                        <a
                          href="https://www.veteranscrisisline.net/get-help-now/chat/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                        >
                          <ChatBubbleLeftRightIcon className="h-5 w-5" />
                          <div>
                            <div className="font-bold">Online Chat</div>
                            <div className="text-sm">veteranscrisisline.net/chat</div>
                          </div>
                        </a>
                      </div>

                      {/* Additional Resources */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Other Resources</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>
                            <strong>Suicide Prevention Lifeline:</strong>{' '}
                            <a href="tel:988" className="text-blue-600 hover:underline">988</a>
                          </li>
                          <li>
                            <strong>Vet Centers:</strong>{' '}
                            <a href="tel:1-877-927-8387" className="text-blue-600 hover:underline">1-877-WAR-VETS</a>
                          </li>
                          <li>
                            <strong>Wounded Warrior Project:</strong>{' '}
                            <a href="tel:1-888-997-2586" className="text-blue-600 hover:underline">1-888-997-2586</a>
                          </li>
                          <li>
                            <a
                              href="https://www.mentalhealth.va.gov/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              VA Mental Health Services
                            </a>
                          </li>
                        </ul>
                      </div>

                      {/* Important Note */}
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
                        <p className="text-xs text-yellow-800">
                          <strong>Important:</strong> This is not a crisis service. If you're in immediate danger,
                          call 911 or go to your nearest emergency room.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CrisisSupport;
