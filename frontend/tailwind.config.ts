import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                border: "hsl(var(--t-colors-border))",
                input: "hsl(var(--t-colors-input))",
                ring: "hsl(var(--t-colors-ring))",
                background: "hsl(var(--t-colors-background))",
                foreground: "hsl(var(--t-colors-foreground))",
                primary: {
                    DEFAULT: "hsl(var(--t-colors-primary))",
                    foreground: "hsl(var(--t-colors-primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--t-colors-secondary))",
                    foreground: "hsl(var(--t-colors-secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--t-colors-destructive))",
                    foreground: "hsl(var(--t-colors-destructive-foreground))",
                    subtle: "hsl(var(--t-colors-destructive-subtle))",
                    "subtle-foreground": "hsl(var(--t-colors-destructive-subtle-foreground))",
                },
                success: {
                    DEFAULT: "hsl(var(--t-colors-success))",
                    foreground: "hsl(var(--t-colors-success-foreground))",
                    subtle: "hsl(var(--t-colors-success-subtle))",
                    "subtle-foreground": "hsl(var(--t-colors-success-subtle-foreground))",
                },
                warning: {
                    DEFAULT: "hsl(var(--t-colors-warning))",
                    foreground: "hsl(var(--t-colors-warning-foreground))",
                    subtle: "hsl(var(--t-colors-warning-subtle))",
                    "subtle-foreground": "hsl(var(--t-colors-warning-subtle-foreground))",
                },
                info: {
                    DEFAULT: "hsl(var(--t-colors-info))",
                    foreground: "hsl(var(--t-colors-info-foreground))",
                    subtle: "hsl(var(--t-colors-info-subtle))",
                    "subtle-foreground": "hsl(var(--t-colors-info-subtle-foreground))",
                },
                indigo: {
                    DEFAULT: "hsl(var(--t-colors-indigo))",
                    foreground: "hsl(var(--t-colors-indigo-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--t-colors-muted))",
                    foreground: "hsl(var(--t-colors-muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--t-colors-accent))",
                    foreground: "hsl(var(--t-colors-accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--t-colors-popover))",
                    foreground: "hsl(var(--t-colors-popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--t-colors-card))",
                    foreground: "hsl(var(--t-colors-card-foreground))",
                },
            },
            borderRadius: {
                lg: "var(--t-radius-lg)",
                md: "var(--t-radius-md)",
                sm: "var(--t-radius-sm)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [animate],
}

