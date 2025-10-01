// Letter feature definitions
// Each letter is represented by a 14-element binary vector
export const letters = {
    'a': [1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0],
    'b': [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0],
    'c': [1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    'd': [1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0],
    'e': [1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    'f': [1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    'g': [1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    'h': [0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0],
    'i': [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0],
    'j': [0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0],
    'k': [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    'l': [0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    'm': [0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0],
    'n': [0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1],
    'o': [1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0],
    'p': [1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0],
    'q': [1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1],
    'r': [1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1],
    's': [1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    't': [1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0],
    'u': [0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0],
    'v': [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0],
    'w': [0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1],
    'x': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
    'y': [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0],
    'z': [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0]
};

// Four-letter word list for the model
// This is a subset - full implementation would include all 1179 four-letter words
export const WORD_LIST = [
    'have', 'gave', 'save', 'male', 'move', 'work', 'word', 'weak', 'wear',
    'able', 'back', 'ball', 'bank', 'base', 'bear', 'beat', 'been', 'bell',
    'best', 'bill', 'bird', 'blue', 'boat', 'body', 'book', 'born', 'both',
    'call', 'came', 'card', 'care', 'case', 'cast', 'city', 'club', 'cold',
    'come', 'cool', 'cost', 'dark', 'data', 'date', 'dead', 'deal', 'dear',
    'deep', 'door', 'down', 'draw', 'drop', 'duty', 'each', 'earl', 'earn',
    'ease', 'east', 'easy', 'edge', 'else', 'even', 'ever', 'face', 'fact',
    'fail', 'fair', 'fall', 'farm', 'fast', 'fear', 'feel', 'feet', 'fell',
    'felt', 'file', 'fill', 'film', 'find', 'fine', 'fire', 'firm', 'fish',
    'five', 'flat', 'flow', 'food', 'foot', 'form', 'four', 'free', 'from',
    'full', 'fund', 'gain', 'game', 'gate', 'girl', 'give', 'glad', 'goal',
    'goes', 'gold', 'gone', 'good', 'gray', 'grew', 'grow', 'half', 'hall',
    'hand', 'hang', 'hard', 'harm', 'hate', 'head', 'hear', 'heat', 'held',
    'hell', 'help', 'here', 'hero', 'high', 'hill', 'hire', 'hold', 'hole',
    'holy', 'home', 'hope', 'host', 'hour', 'huge', 'hung', 'hurt', 'idea',
    'inch', 'iron', 'item', 'join', 'jump', 'just', 'keep', 'kept', 'kill',
    'kind', 'king', 'knee', 'knew', 'know', 'lack', 'lady', 'laid', 'lake',
    'land', 'lane', 'last', 'late', 'lead', 'left', 'less', 'life', 'lift',
    'like', 'line', 'link', 'list', 'live', 'load', 'loan', 'lock', 'long',
    'look', 'lord', 'lose', 'loss', 'lost', 'love', 'made', 'mail', 'main',
    'make', 'many', 'mark', 'mass', 'mate', 'mean', 'meat', 'meet', 'mere',
    'mile', 'milk', 'mill', 'mind', 'mine', 'miss', 'mode', 'moon', 'more',
    'most', 'much', 'must', 'name', 'near', 'neck', 'need', 'news', 'next',
    'nice', 'nine', 'none', 'noon', 'nose', 'note', 'once', 'only', 'onto',
    'open', 'oral', 'over', 'pace', 'pack', 'page', 'paid', 'pain', 'pair',
    'pale', 'park', 'part', 'pass', 'past', 'path', 'peak', 'pick', 'pink',
    'plan', 'play', 'plot', 'plus', 'poll', 'pool', 'poor', 'port', 'post',
    'pull', 'pure', 'push', 'race', 'rail', 'rain', 'rank', 'rare', 'rate',
    'read', 'real', 'rear', 'rely', 'rent', 'rest', 'rice', 'rich', 'ride',
    'ring', 'rise', 'risk', 'road', 'rock', 'role', 'roll', 'roof', 'room',
    'root', 'rose', 'rule', 'runs', 'safe', 'said', 'sake', 'sale', 'salt',
    'same', 'sand', 'seat', 'seed', 'seek', 'seem', 'seen', 'self', 'sell',
    'send', 'sent', 'ship', 'shop', 'shot', 'show', 'shut', 'side', 'sign',
    'site', 'size', 'skin', 'slip', 'slow', 'snow', 'soft', 'soil', 'sold',
    'sole', 'some', 'song', 'soon', 'sort', 'soul', 'spot', 'star', 'stay',
    'step', 'stop', 'such', 'suit', 'sure', 'take', 'tale', 'talk', 'tall',
    'tank', 'tape', 'task', 'team', 'tear', 'tell', 'tend', 'term', 'test',
    'text', 'than', 'that', 'them', 'then', 'they', 'thin', 'this', 'thus',
    'tide', 'tied', 'tier', 'till', 'time', 'tiny', 'told', 'tone', 'took',
    'tool', 'tops', 'torn', 'tour', 'town', 'tree', 'trip', 'true', 'tune',
    'turn', 'twin', 'type', 'unit', 'upon', 'used', 'user', 'vary', 'vast',
    'very', 'vice', 'view', 'vote', 'wage', 'wait', 'wake', 'walk', 'wall',
    'want', 'ward', 'warm', 'warn', 'wash', 'wave', 'ways', 'week', 'well',
    'went', 'were', 'west', 'what', 'when', 'whom', 'wide', 'wife', 'wild',
    'will', 'wind', 'wine', 'wing', 'wire', 'wise', 'wish', 'with', 'wood',
    'yard', 'yeah', 'year', 'your', 'zone'
];

/**
 * Helper function to convert letter to index
 * @param {string} letter - Single character letter
 * @returns {number} Index from 0-25
 */
export function letterToIndex(letter) {
    return letter.charCodeAt(0) - 'a'.charCodeAt(0);
}

/**
 * Helper function to convert index to letter
 * @param {number} index - Index from 0-25
 * @returns {string} Single character letter
 */
export function indexToLetter(index) {
    return String.fromCharCode(index + 'a'.charCodeAt(0));
}
