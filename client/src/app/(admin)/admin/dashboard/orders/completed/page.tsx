"use client";

import useSWR from "swr";
import { IoFastFoodOutline } from "react-icons/io5";
import Modal from "@/components/ui/Modal";
import { useState } from "react";
import InputField from "@/components/ui/InputField";
import { Order, OrderItem, useUpdateOrderStatusMutation } from "@/state/api";
import Swal from "sweetalert2";

const fetcher = (url: string | URL | Request) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error("Erro ao carregar os pedidos");
    }
    return res.json();
  });

const CompletedOrdersPage = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<string>("");
  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const { data: orders, error } = useSWR(
    `${apiUrl}/order/getorderbystatusroomid?status=READY`,
    fetcher,
    { refreshInterval: 5000 }
  );

  console.log(orders);

  if (error) return <div>Erro ao carregar pedidos</div>;
  if (!orders) return <div>Carregando...</div>;

  const openModal = (order: Order) => {
    setSelectedOrder(order);
    setStatus(order.status); // Guardamos o estado atual do pedido
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setStatus(e.target.value); // Atualizamos o estado
    console.log();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateOrderStatus({ orderId: selectedOrder?.id ?? 0, status });

      closeModal();
      Swal.fire("Sucesso", "Estado do pedido atualizado.", "success");
    } catch (error) {
      console.error("Erro ao atualizar o estado do pedido:", error);
      Swal.fire(
        "Erro",
        "Ocorreu um erro ao atualizar o estado do pedido.",
        "error"
      );
    }
  };

  return (
    <div className="font-raleway py-10 lg:py-0">
      <h1 className="text-2xl font-black text-primary-green">
        Pedidos Prontos
      </h1>
      <div className="flex flex-wrap gap-8 py-3">
        {Array.isArray(orders) && orders.length > 0 ? (
          orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-center space-x-2 relative cursor-pointer hover:bg-gray-100 bg-gray-300 rounded-full h-[7rem] w-[7rem] border border-gray-300"
              onClick={() => openModal(order)} // Passamos o pedido ao abrir o modal
            >
              <IoFastFoodOutline className="text-[5rem] text-primary-green" />
              <span className="text-lg font-quicksand font-bold absolute -bottom-6">
                {order.roomNumber}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Não há pedidos prontos.</p>
        )}
      </div>
      {isModalOpen && selectedOrder && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title="Detalhes do Pedido"
        >
          <form
            onSubmit={handleSubmit}
            className="font-quicksand w-full max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md"
          >
            <p>
              <strong>Cliente:</strong> {selectedOrder.clientName}
            </p>
            <p>
              <strong>Número do Quarto:</strong> {selectedOrder.roomNumber}
            </p>
            <p>
              <strong>Total:</strong> ${selectedOrder.total}
            </p>
            <p>
              <strong>Estado Atual:</strong> {selectedOrder.status}
            </p>

            <h3 className="mt-4 text-md font-semibold">Ítens do Pedido:</h3>
            <ul className="list-disc pl-5 pb-2">
              {selectedOrder.orderItems.map((item: OrderItem) => (
                <li key={item.id} className="py-1">
                  <span>
                    <strong>{item.dish.name.pt}:</strong> {item.quantity} x $
                    {item.dish.price}
                  </span>
                </li>
              ))}
            </ul>

            <InputField
              label="Novo Estado"
              name="status"
              type="select"
              value={status}
              onChange={handleChange}
              required
              options={[
                { value: "PENDING", label: "Pendente" },
                { value: "COOKING", label: "Cozinhando" },
                { value: "READY", label: "Pronto" },
                { value: "DELIVERED", label: "Entregue" },
                { value: "CANCEL", label: "Cancelado" },
              ]}
            />

            <div className="modal-action">
              <button
                type="button"
                onClick={closeModal}
                className="py-2 px-4 text-xs hover:bg-opacity-70 text-white bg-red-700 bg-opacity-80"
              >
                Fechar
              </button>
              <button
                type="submit"
                className="py-2 px-4 text-xs hover:bg-opacity-70 text-white bg-blue-700 bg-opacity-80"
              >
                Atualizar Estado
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CompletedOrdersPage;
