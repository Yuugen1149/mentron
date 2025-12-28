'use client';

/**
 * Animated word-cycling loader component
 * Shows "loading" with cycling context words
 */
export function WordLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
            <div className="word-loader-card">
                <div className="word-loader">
                    <p>loading</p>
                    <div className="word-loader-words">
                        <span className="word-loader-word">students</span>
                        <span className="word-loader-word">materials</span>
                        <span className="word-loader-word">groups</span>
                        <span className="word-loader-word">dashboard</span>
                        <span className="word-loader-word">students</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .word-loader-card {
                    --bg-color: #111;
                    background-color: var(--bg-color);
                    padding: 1rem 2rem;
                    border-radius: 1.25rem;
                }

                .word-loader {
                    color: rgb(124, 124, 124);
                    font-family: inherit;
                    font-weight: 500;
                    font-size: 25px;
                    box-sizing: content-box;
                    height: 40px;
                    padding: 10px 10px;
                    display: flex;
                    border-radius: 8px;
                }

                .word-loader-words {
                    overflow: hidden;
                    position: relative;
                }

                .word-loader-words::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        var(--bg-color) 10%,
                        transparent 30%,
                        transparent 70%,
                        var(--bg-color) 90%
                    );
                    z-index: 20;
                }

                .word-loader-word {
                    display: block;
                    height: 100%;
                    padding-left: 6px;
                    color: #956afa;
                    animation: word-spin 4s infinite;
                }

                @keyframes word-spin {
                    10% {
                        transform: translateY(-102%);
                    }
                    25% {
                        transform: translateY(-100%);
                    }
                    35% {
                        transform: translateY(-202%);
                    }
                    50% {
                        transform: translateY(-200%);
                    }
                    60% {
                        transform: translateY(-302%);
                    }
                    75% {
                        transform: translateY(-300%);
                    }
                    85% {
                        transform: translateY(-402%);
                    }
                    100% {
                        transform: translateY(-400%);
                    }
                }
            `}</style>
        </div>
    );
}
