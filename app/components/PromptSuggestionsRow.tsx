import PromptSuggestionButton from "./PromptSuggestionButton"

const PromptSuggestionsRow = ({ onPromptClick }) => {
    const prompts = [
        "How do I search for people given their current title, current company and location?",
        "Can I filter results by date or other parameters?",
        "What kinds of endpoints does crustdata offer?",
        "I tried using the screener/person/search API to compare against previous values, is there a standard you're using for the region values?",
    ]
    
    return (
        <div className="prompt-suggestions-row">
            {prompts.map((prompt, index) => <PromptSuggestionButton 
            key={'suggestion-${index}'}
            text={prompt}
            onClick={() => onPromptClick(prompt)}
            />)}
        </div>
    )
}

export default PromptSuggestionsRow