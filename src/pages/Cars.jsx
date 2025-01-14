import { useState } from "react";
import CarsCards from "../components/CarsCards";
import LoadingSpinner from "../components/LoadingSpinner";
import { useCars } from "../contexts/car-context";
import Modal from "../components/Modal";
import AddCarForm from "../features/Cars/components/AddCarForm";

export default function Cars() {
  const { isAllCarLoading } = useCars();
  const [isAddCarModalOpen, setIsAddCarModalOpen] = useState(false);
  const openAddCarModal = () => setIsAddCarModalOpen(true);
  const closeAddCarModal = () => setIsAddCarModalOpen(false);

  return (
    <>
      {isAllCarLoading ?
        <div className='h-full flex items-center'>
          <LoadingSpinner />
        </div>
        :
        <div>
          <div>
            <div className="p-4">
              <button
                onClick={openAddCarModal}
                className="bg-blue-500 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out hover:bg-blue-700 w-32"
              >
                New Car
              </button>
              <Modal
                open={isAddCarModalOpen}
                onClose={closeAddCarModal}
                title="Add new car"
              >
                <AddCarForm setIsAddCarModalOpen={setIsAddCarModalOpen}/>
              </Modal>
            </div>
          </div>
          <CarsCards />
        </div>
      }
    </>
  );
}
