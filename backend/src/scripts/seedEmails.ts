import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { EmailTemplate } from '../models/EmailTemplate.js';

const templates = [
    {
        name: 'verification',
        subject: 'Verifica tu cuenta - {{appName}}',
        body: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #2563eb; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">{{appName}}</h1>
    </div>
    <div style="padding: 32px; color: #1e293b; line-height: 1.6;">
        <h2 style="margin-top: 0; color: #0f172a;">¡Hola {{name}}!</h2>
        <p>Gracias por unirte a <strong>{{appName}}</strong>. Estamos emocionados de tenerte con nosotros.</p>
        <p>Para comenzar, por favor confirma tu dirección de correo electrónico haciendo clic en el botón de abajo:</p>
        
        <div style="text-align: center; margin: 32px 0;">
            <a href="{{link}}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; transition: background-color 0.2s;">
                Confirmar mi cuenta
            </a>
        </div>
        
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; border: 1px dashed #cbd5e1; margin-top: 24px;">
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; font-weight: 600;">¿El botón no funciona? Copia y pega este enlace:</p>
            <p style="margin: 0; font-size: 12px; word-break: break-all; color: #2563eb;">{{link}}</p>
        </div>
        
        <p style="margin-top: 32px; font-size: 14px; color: #64748b;">
            Este enlace es válido por 24 horas. Si no creaste una cuenta en {{appName}}, puedes ignorar este correo de forma segura.
        </p>
    </div>
    <div style="background-color: #f1f5f9; padding: 24px; text-align: center; color: #64748b; font-size: 12px;">
        <p style="margin: 0 0 8px 0;">&copy; {{currentYear}} {{companyName}}. Todos los derechos reservados.</p>
        <p style="margin: 0;">¿Necesitas ayuda? Visita nuestro <a href="{{supportUrl}}" style="color: #2563eb; text-decoration: underline;">Centro de Soporte</a>.</p>
    </div>
</div>
        `,
        variables: ['name', 'link', 'appName', 'companyName', 'currentYear', 'supportUrl'],
    },
    {
        name: 'password-reset',
        subject: 'Restablecer contraseña - {{appName}}',
        body: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #0f172a; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">{{appName}}</h1>
    </div>
    <div style="padding: 32px; color: #1e293b; line-height: 1.6;">
        <h2 style="margin-top: 0; color: #0f172a;">Recuperación de Contraseña</h2>
        <p>Hola {{name}},</p>
        <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>{{appName}}</strong>.</p>
        <p>Haz clic en el botón de abajo para elegir una nueva contraseña:</p>
        
        <div style="text-align: center; margin: 32px 0;">
            <a href="{{link}}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Restablecer Contraseña
            </a>
        </div>

        <div style="background-color: #fff7ed; padding: 16px; border-radius: 6px; border: 1px solid #fed7aa; margin: 24px 0;">
            <h4 style="margin: 0 0 8px 0; color: #9a3412; font-size: 14px;">Detalles de la solicitud:</h4>
            <ul style="margin: 0; padding: 0 0 0 20px; font-size: 13px; color: #c2410c;">
                <li><strong>Fecha:</strong> {{datetime}}</li>
                <li><strong>IP:</strong> {{ip}}</li>
                <li><strong>Dispositivo:</strong> {{userAgent}}</li>
            </ul>
        </div>
        
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; border: 1px dashed #cbd5e1;">
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; font-weight: 600;">Enlace de respaldo:</p>
            <p style="margin: 0; font-size: 12px; word-break: break-all; color: #2563eb;">{{link}}</p>
        </div>
        
        <p style="margin-top: 32px; font-size: 14px; color: #64748b;">
            Si no solicitaste este cambio, por favor ignora este correo. Tu contraseña permanecerá igual y tu cuenta seguirá segura.
        </p>
    </div>
    <div style="background-color: #f1f5f9; padding: 24px; text-align: center; color: #64748b; font-size: 12px;">
        <p style="margin: 0 0 8px 0;">&copy; {{currentYear}} {{companyName}}. Todos los derechos reservados.</p>
        <p style="margin: 0;">¿Dudas sobre seguridad? <a href="{{supportUrl}}" style="color: #2563eb; text-decoration: underline;">Contacta con Soporte</a>.</p>
    </div>
</div>
        `,
        variables: ['name', 'link', 'appName', 'companyName', 'currentYear', 'supportUrl', 'ip', 'userAgent', 'datetime'],
    }
];

const seedEmails = async () => {
    try {
        await mongoose.connect(env.mongoUri, { dbName: env.mongoDbName });
        console.log('Connected to MongoDB');

        console.log('Deleting existing templates...');
        await EmailTemplate.deleteMany({});
        console.log('Templates deleted.');

        for (const t of templates) {
            await EmailTemplate.findOneAndUpdate(
                { name: t.name },
                t,
                { upsert: true, new: true }
            );
            console.log(`Seeded template: ${t.name}`);
        }

        console.log('Email templates seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding emails:', error);
        process.exit(1);
    }
};

seedEmails();
