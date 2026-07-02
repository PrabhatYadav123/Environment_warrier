import typography from "@tailwindcss/typography";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: "#1f6f4a",
        leaf: "#79b857",
        sun: "#f2b84b",
        ink: "#17211b",
        mist: "#f3f7f1"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(23, 33, 27, 0.10)"
      }
    }
  },
  plugins: [typography]
};
