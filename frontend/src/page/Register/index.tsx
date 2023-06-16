import style from './Register.module.css';
import logo from '../../assets/logo.webp'
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { api } from '../../server';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { BsKey, BsPerson } from 'react-icons/bs';
import { AiOutlineMail } from  'react-icons/ai';

interface IFormValues {
    name: string;
    email: string;
    password: string;
}

export function Register() {
    const schema = yup.object().shape({
        name: yup.string().required('Campo de nome obrigatorio'),
        email: yup
            .string()
            .email('Digite um email válido')
            .required('Campo obrigatório'),
        password: yup
            .string()
            .min(6, 'Minimo de 6 caracteres').
            required('Campo de senha obrigatorio'),
    });
    const {
        register, 
        handleSubmit,  
        formState: {errors},
        } =  useForm<IFormValues>({resolver: yupResolver(schema)}
    );
    const submit = handleSubmit(async (data) => {
        await api.post('/users', {
            name: data.name,
            email: data.email,
            password: data.password,
        });
    });

    return(
        <div className={style.background}> 
            <div className='container'>
                <p className={style.navigate}>
                    <Link to={'/'}>Home</Link>  {'>'} Àrea do Cadastro</p>
                <div className={style.wrapper}> 
                    <div className={style.imageContainer}>
                        <img src={logo} alt="" />
                    </div>
                    <div className={style.card}>
                        <h2>Olá seja bem-vindo</h2>
                        <form onSubmit={submit}>
                            <Input 
                                placeholder="Nome"
                                type='text'
                                {...register('name', {required: true})}
                                error={errors.name && errors.name.message}
                                icon={<BsPerson size={20}/>}
                            />
                            <Input 
                                placeholder="Email"
                                type='text'
                                {...register('email', {required: true})}
                                error={errors.email && errors.email.message}
                                icon={<AiOutlineMail size={20}/>}
                            />
                            <Input 
                                placeholder="Senha"
                                type='password'
                                {...register('password', {required: true})}
                                error={errors.password && errors.password.message}
                                icon={<BsKey size={20}/>}
                            />
                            <Button text='Cadastrar'/>
                        </form>
                        <div className={style.register}>
                            <span>
                                Já tem cadastro? 
                                <Link to={'/'}>Voltar a página inicial</Link>{' '}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}