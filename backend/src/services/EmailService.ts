import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { EmailTemplate } from '../models/EmailTemplate.js';
import { EmailLog } from '../models/EmailLog.js';
import { UserDocument } from '../models/User.js';

class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: env.smtpHost,
            port: env.smtpPort,
            secure: env.smtpSecure,
            auth: {
                user: env.smtpUser,
                pass: env.smtpPass,
            },
        });
    }

    async sendEmail(to: string, templateName: string, variables: Record<string, unknown>) {
        try {
            const template = await EmailTemplate.findOne({ name: templateName, isActive: true });

            let subject = '';
            let html = '';

            // Global variables (shared across all templates)
            const globalVariables = {
                appName: 'SanttProject',
                companyName: 'SanttProject S.L.',
                supportUrl: `${env.corsOrigin}/support`,
                currentYear: new Date().getFullYear().toString(),
                datetime: new Date().toLocaleString('es-ES', { timeZone: 'UTC' }) + ' UTC',
                corsOrigin: env.corsOrigin,
            };

            const allVariables: Record<string, unknown> = { ...globalVariables, ...variables };

            if (template) {
                // Replace variables in subject and body
                subject = this.replaceVariables(template.subject, allVariables);
                html = this.replaceVariables(template.body, allVariables);
            } else {
                // Fallback or error if template required
                console.warn(`Template ${templateName} not found. Using variable fallback if provided.`);
                if (templateName === 'verification') {
                    subject = `Verifica tu cuenta en ${globalVariables.appName}`;
                    html = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                            <h2>Hola ${allVariables['name'] || ''},</h2>
                            <p>Bienvenido a <strong>${globalVariables.appName}</strong>. Por favor, confirma tu correo:</p>
                            <a href="${allVariables['link'] || '#'}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Confirmar Email</a>
                            <p style="margin-top: 20px; font-size: 12px; color: #666;">O copia este link: ${allVariables['link'] || ''}</p>
                        </div>
                    `;
                } else if (templateName === 'password-reset') {
                    subject = `Restablecer contraseña - ${globalVariables.appName}`;
                    html = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                            <h2>Hola ${allVariables['name'] || ''},</h2>
                            <p>Has solicitado restablecer tu contraseña en <strong>${globalVariables.appName}</strong>.</p>
                            <a href="${allVariables['link'] || '#'}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Restablecer Contraseña</a>
                            <p style="margin-top: 20px; font-size: 12px; color: #666;">Si no fuiste tú, ignora este mensaje.</p>
                        </div>
                    `;
                } else {
                    throw new Error('Template not found');
                }
            }

            await this.transporter.sendMail({
                from: `"${env.smtpFrom}" <${env.smtpUser}>`,
                to,
                subject,
                html,
            });

            await EmailLog.create({
                recipient: to,
                templateName,
                status: 'success',
                metadata: allVariables,
            });

            console.log(`Email sent to ${to} using template ${templateName}`);
        } catch (error: unknown) {
            console.error(`Error sending email to ${to}:`, error);
            await EmailLog.create({
                recipient: to,
                templateName,
                status: 'failed',
                error: error instanceof Error ? error.message : String(error),
                metadata: variables,
            });
        }
    }

    private replaceVariables(text: string, variables: Record<string, unknown>): string {
        return text.replace(/{{(.*?)}}/g, (_, key) => {
            const value = variables[key.trim()];
            return value !== undefined ? String(value) : '';
        });
    }

    async sendVerificationEmail(user: UserDocument, token: string, context?: { ip?: string; userAgent?: string }) {
        const link = `${env.corsOrigin}/verify-email?token=${token}`;
        await this.sendEmail(user.email, 'verification', {
            name: user.name,
            link,
            ...(context || {})
        });
    }

    async sendPasswordResetEmail(user: UserDocument, token: string, context?: { ip?: string; userAgent?: string }) {
        const link = `${env.corsOrigin}/reset-password?token=${token}`;
        await this.sendEmail(user.email, 'password-reset', {
            name: user.name,
            link,
            ...(context || {})
        });
    }
}

export const emailService = new EmailService();
