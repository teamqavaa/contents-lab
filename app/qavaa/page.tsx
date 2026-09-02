"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PartyPopper, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface OrderItem {
  id: string;
  course: {
    title: string;
    price: string;
  };
}

interface Order {
  id: string;
  total_amount: string;
  items: OrderItem[];
}

export default function QavaaSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    async function fetchOrderDetails() {
      try {
        const res = await fetch(`http://127.0.0.1:8080/api/orders/${orderId}/`, {
          headers: {
            // Add your authentication token if necessary
          },
        });
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (err) {
        console.error("Error loading order", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrderDetails();
  }, [orderId]);

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

        {/* Left side: Joyful icon and success message */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-bounce">
            <PartyPopper className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-bold text-neutral-900">
            Congratulations!
          </h1>

          <p className="text-neutral-600 text-sm leading-relaxed">
            You have successfully registered for this course/exam. Your payment has been validated and your access is now active.
          </p>

          <Link
            href="/dashboard"
            className="mt-4 px-6 py-3 bg-black text-white text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors"
          >
            Go to my courses
          </Link>
        </div>

        {/* Right side: List of courses in the order */}
        <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-100 flex flex-col gap-4">
          <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Included Courses / Exams
          </h2>

          {loading ? (
            <p className="text-sm text-neutral-500">Loading courses...</p>
          ) : order && order.items ? (
            <div className="flex flex-col gap-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-neutral-200"
                >
                  <span className="text-sm font-semibold text-neutral-800">
                    {item.course.title}
                  </span>
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">Order details not available.</p>
          )}
        </div>

      </div>
    </main>
  );
}
