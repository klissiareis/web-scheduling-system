import { AiOutlineClose } from 'react-icons/ai';
import style from './ModalEdit.module.css';
import { useAuth } from '../../hooks/auth';
import { formatISO, getHours, parseISO, setHours } from 'date-fns';
import { api } from '../../server';
import { toast } from 'react-toastify';
import { isAxiosError } from 'axios';
import { useState } from 'react';

interface IModal {
    isOpen: boolean;
    handleChangeModal: () => void;
    hour: string; 
    name: string;
    id: string;
}

export function ModalEdit({isOpen, handleChangeModal, hour, name, id}: IModal) {
    const { availableSchedules, schedules, date, handleSetDate  } = useAuth();
    const [hourSchedule, setHourSchedule] = useState('');
    const currentValue = new Date().toISOString().split('T')[0];
    const filteredDate = availableSchedules.filter((hour) => {
        const isScheduleAvailble = !schedules.find((scheduleItem) => { 
            const scheduleDate = new Date(scheduleItem.date);
            const scheduleHour = getHours(scheduleDate);
            return scheduleHour === Number(hour);
        });
        return isScheduleAvailble;
    })
    const handleChangeHour = (hour: string) => {
        setHourSchedule(hour);
    };
    const updateData = async ()=>{
        const formattedDate = formatISO(setHours(parseISO(date), parseInt(hourSchedule)));
        try {
            await api.put(`/schedules/${id}`, {
                params: {
                    date: formattedDate,
                },
            });
            toast.success('Atualizado com sucesso');
            handleChangeModal();
        } catch (error) {
            if(isAxiosError(error)) {
                toast.error(error.response?.data.message);
            }
        }
    };

    if(isOpen) {
        return (
            <div className={style.background}>
                <div className={style.modal}>
                    <div className={style.header}>
                        <h2>Editar horário</h2>
                        <AiOutlineClose size={25} onClick={handleChangeModal}/>
                    </div>
                    <div className={style.body}>
                        <p>{hour}h {name}</p>
                        <div className={style.input}>
                            <label htmlFor="">Indique uma nova data</label>
                            <input 
                                type="date" 
                                defaultValue={currentValue} 
                                min={currentValue}
                                onChange={(e) => handleSetDate(e.target.value)}/>   
                        </div>
                        <div className={style.input}>
                            <label htmlFor="">Indique um novo horário</label>
                            <select name="" id="" onChange={(e) => handleChangeHour(e.target.value)}>
                                {filteredDate.map((hour, index) => {
                                    return (
                                        <option value={hour} key={index}>{hour}:00</option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>
                    <div className={style.footer}>
                        <button onClick={handleChangeModal}>Cancelar</button>
                        <button onClick={updateData}>Editar</button>
                    </div>
                </div>
            </div>
        );
    } else {
        <></>;
    }
}