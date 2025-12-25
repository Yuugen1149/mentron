// Root page - rewrite handles serving landing page
// The Next.js rewrite in next.config.ts serves /landing/index.html at /
export default function RootPage() {
    return (
        <iframe
            src="/landing/index.html"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
                margin: 0,
                padding: 0,
                overflow: 'hidden'
            }}
            title="MENTRON Landing Page"
        />
    );
}
