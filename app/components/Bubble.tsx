import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // To enable GitHub-flavored Markdown (e.g., tables, strikethrough)
import rehypeHighlight from 'rehype-highlight'; // For syntax highlighting
import 'highlight.js/styles/github.css'; // Optional: Style for code blocks

const Bubble = ({ message }: { message: { role: string; content: string } }) => {
  return (
    <div className={`bubble ${message.role}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        rehypePlugins={[rehypeHighlight]}
      >
        {message.content}
      </ReactMarkdown>
    </div>
  );
};

export default Bubble;
