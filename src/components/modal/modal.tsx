import { Transition, Dialog } from '@headlessui/react'
import React, { Dispatch, Fragment, SetStateAction } from 'react'

// * Reference: https://headlessui.com/react/dialog
type ComponentProps = {
    isOpen: boolean
    setIsOpen: Dispatch<SetStateAction<boolean>>
    children: React.ReactNode
    className: string
}
export const Modal: React.FC<ComponentProps> = ({
    isOpen,
    setIsOpen,
    children,
    className,
}) => {
    return (
        <>
            <Transition show={isOpen} as={Fragment}>
                <Dialog onClose={() => setIsOpen(false)}>
                    {/*
          Use one Transition.Child to apply one transition to the backdrop...
        */}
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/30" />
                    </Transition.Child>

                    {/*
          ...and another Transition.Child to apply a separate transition
          to the contents.
        */}
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <div className="fixed inset-0 flex items-center justify-center p-4">
                            {/* Container to center the panel */}
                            <div className="flex min-h-full items-center justify-center">
                                {/* The actual dialog panel  */}
                                <Dialog.Panel className={className}>
                                    {children}
                                </Dialog.Panel>
                            </div>
                        </div>
                    </Transition.Child>
                </Dialog>
            </Transition>
        </>
    )
}
