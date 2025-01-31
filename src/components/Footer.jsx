import { FaChess, FaTwitter, FaFacebook, FaInstagram } from "react-icons/fa"

const Footer = () => {
    return (
        <footer className="bg-gray-600 text-white py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center mb-4 md:mb-0">
                        <FaChess className="text-3xl mr-2 text-yellow-400" />
                        <span className="text-xl font-bold">Chess Master</span>
                    </div>
                    <div className="flex space-x-4">
                        <SocialLink href="#" icon={<FaTwitter />} />
                        <SocialLink href="#" icon={<FaFacebook />} />
                        <SocialLink href="#" icon={<FaInstagram />} />
                    </div>
                </div>
                <div className="mt-8 text-center text-sm">
                    <p>&copy; 2023 Chess Master. All rights reserved.</p>
                    <p className="mt-2">Crafted with ♟️ by chess enthusiasts for chess enthusiasts.</p>
                </div>
            </div>
        </footer>
    )
}

const SocialLink = ({ href, icon }) => (
    <a href={href} className="text-gray-400 hover:text-white transition-colors duration-300 transform hover:scale-110">
        {icon}
    </a>
)

export default Footer
