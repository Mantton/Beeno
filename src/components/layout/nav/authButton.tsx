import Link from "next/link";
import { FiAward, FiTag, FiUser } from "react-icons/fi";
import { Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
export default function NavAuthButton() {
  const session = useSession();
  const [show, setShow] = useState(false);
  const user = session.data?.user;

  if (session.status === "loading") {
    return (
      <>
        <p>Loading</p>
      </>
    );
  }
  const accountPath = user
    ? `/collector/${user.id}/${user.name ?? ""}`
    : "/flow/login";
  const listStyle =
    "py-2 transition-colors duration-300 hover:bg-red-300 hover:bg-opacity-40";
  return (
    <>
      <div
        className="relative group transition-all duration-500 flex items-center text-2xl bg-red-100 hover:bg-red-200 p-2 rounded-full"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        <Link href={accountPath}>
          <a>
            {user && user.image ? (
              <div className="h-6 w-6 rounded-full">
                <Image
                  src={user.image}
                  alt="profile_image"
                  layout="fill"
                  objectFit="cover"
                  className="bg-red-500 rounded-full"
                />
              </div>
            ) : (
              <FiUser />
            )}
          </a>
        </Link>
        <Transition
          as={Fragment}
          show={show}
          enter="transition ease-out duration-300"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-100"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <div className="absolute -right-4 top-0 mt-12 w-56 origin-bottom-right divide-y divide-gray-100 rounded-md bg-red-50 shadow-lg">
            <ul className="py-2  text-lg font-light">
              <li className={listStyle}>
                {user && (
                  <Link href={accountPath}>
                    <a
                      className="w-full px-4 flex items-center gap-2"
                      onClick={() => setShow(false)}
                    >
                      <FiUser />
                      <span> Profile </span>
                    </a>
                  </Link>
                )}
                {!user && (
                  <button onClick={() => signIn()}>
                    <div className="w-full px-4 flex items-center gap-2">
                      <FiUser />

                      <span>Sign In</span>
                    </div>
                  </button>
                )}
              </li>
              <li className={listStyle}>
                <Link href="/leaderboard">
                  <a
                    className="w-full px-4 flex items-center gap-2  "
                    onClick={() => setShow(false)}
                  >
                    <FiAward />
                    <span> Leaderboard </span>
                  </a>
                </Link>
              </li>
              <li className={listStyle}>
                <Link href="/hub">
                  <a
                    className="w-full px-4 flex items-center gap-2 "
                    onClick={() => setShow(false)}
                  >
                    <FiTag />
                    <span> Trade Hub </span>
                  </a>
                </Link>
              </li>

              {user && (
                <li className={listStyle}>
                  <button
                    onClick={() => {
                      setShow(false);
                      signOut();
                    }}
                  >
                    <div className="w-full px-4 flex items-center gap-2">
                      <FiUser />
                      <span> Sign Out </span>
                    </div>
                  </button>
                </li>
              )}
            </ul>
          </div>
        </Transition>
      </div>
    </>
  );
}
