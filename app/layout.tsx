import "./global.css"

export const metadata = {
    title: "crust-data-app",
    description: "Build challenge for crust data, API docs chat bot"
}

const RootLayout = ({ children }) => {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}

export default RootLayout