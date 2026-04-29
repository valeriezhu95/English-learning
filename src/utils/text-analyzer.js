/**
 * 文本分析工具 - 分析英文文本的难度和复杂度
 */
const logger = require('./logger');

// 常见词汇 (A1-B2 级别)
const commonWords = new Set([
  // A1 级别核心词 (最常用1000词)
  'a', 'able', 'about', 'above', 'accept', 'according', 'account', 'across', 'act', 'action',
  'activity', 'actually', 'add', 'address', 'adjust', 'admit', 'adult', 'advance', 'advice',
  'advise', 'affect', 'afford', 'afraid', 'after', 'again', 'against', 'age', 'ago', 'agree',
  'agreement', 'ahead', 'aim', 'air', 'all', 'allow', 'almost', 'alone', 'along', 'already',
  'also', 'alternative', 'although', 'always', 'american', 'among', 'amount', 'analysis',
  'analyze', 'and', 'animal', 'announce', 'annual', 'another', 'answer', 'any', 'anybody',
  'anyone', 'anything', 'appear', 'apple', 'apply', 'approach', 'appropriate', 'approve',
  'april', 'area', 'argue', 'argument', 'argue', 'arm', 'around', 'arrive', 'art', 'article',
  'artist', 'as', 'ask', 'assume', 'at', 'attack', 'attend', 'attention', 'attitude',
  'august', 'authority', 'available', 'avoid', 'aware', 'away', 'awesome', 'awful', 'baby',
  'back', 'bad', 'bag', 'ball', 'bank', 'bar', 'base', 'be', 'beat', 'beautiful', 'because',
  'become', 'been', 'before', 'begin', 'behavior', 'behind', 'believe', 'benefit', 'best',
  'better', 'between', 'beyond', 'big', 'bill', 'bit', 'black', 'blood', 'blow', 'blue',
  'board', 'body', 'book', 'born', 'borrow', 'boss', 'bottle', 'bottom', 'box', 'boy',
  'branch', 'bread', 'break', 'bring', 'british', 'brother', 'brought', 'brown', 'build',
  'building', 'business', 'but', 'buy', 'by', 'call', 'can', 'canada', 'cancer', 'capital',
  'car', 'card', 'care', 'career', 'carry', 'case', 'catch', 'cause', 'celebration',
  'center', 'central', 'century', 'certain', 'certainly', 'chair', 'challenge', 'chance',
  'change', 'character', 'charge', 'check', 'child', 'choice', 'choose', 'christmas',
  'city', 'civil', 'claim', 'class', 'clear', 'clearly', 'close', 'coach', 'coast', 'code',
  'coffee', 'cold', 'collect', 'college', 'color', 'come', 'commercial', 'common',
  'company', 'compare', 'computer', 'concern', 'condition', 'conference', 'confidence',
  'confirm', 'congress', 'connect', 'consider', 'consist', 'contact', 'contain', 'content',
  'contest', 'continue', 'control', 'conversation', 'convert', 'cook', 'cool', 'copy',
  'cost', 'council', 'country', 'couple', 'course', 'court', 'cousin', 'cover', 'crack',
  'create', 'crime', 'crisis', 'critical', 'cross', 'crowd', 'culture', 'cup', 'current',
  'cut', 'dad', 'damage', 'dance', 'danger', 'dark', 'data', 'date', 'daughter', 'day',
  'dead', 'deal', 'death', 'debate', 'decide', 'decision', 'deep', 'defense', 'degree',
  'deliver', 'demand', 'democrat', 'democratic', 'department', 'depend', 'describe',
  'description', 'design', 'desire', 'desk', 'despite', 'determine', 'detail', 'develop',
  'development', 'device', 'did', 'die', 'difference', 'different', 'difficult',
  'difficulty', 'dinner', 'direction', 'director', 'dirty', 'discover', 'discovery',
  'discuss', 'discussion', 'disease', 'do', 'doctor', 'dog', 'door', 'dose', 'down',
  'draw', 'dream', 'dress', 'drive', 'drop', 'drug', 'during', 'each', 'early', 'earn',
  'east', 'easy', 'eat', 'economic', 'economy', 'edge', 'education', 'effect', 'effort',
  'eight', 'either', 'election', 'else', 'email', 'emerge', 'energy', 'engine', 'english',
  'enjoy', 'enough', 'ensure', 'enter', 'entire', 'entry', 'environment', 'equipment',
  'especially', 'establish', 'estate', 'estimate', 'etc', 'european', 'even', 'evening',
  'event', 'ever', 'every', 'everybody', 'everyone', 'everything', 'evidence', 'exactly',
  'example', 'executive', 'exercise', 'exist', 'exit', 'experience', 'expert', 'explain',
  'explanation', 'explore', 'explosion', 'export', 'exposure', 'express', 'extend',
  'extension', 'extensive', 'extent', 'external', 'extra', 'eye', 'face', 'fact', 'factor',
  'fail', 'failure', 'fall', 'family', 'far', 'farm', 'fast', 'father', 'fear', 'federal',
  'fee', 'feel', 'feeling', 'fellow', 'female', 'few', 'field', 'fifth', 'fifty', 'fight',
  'figure', 'file', 'fill', 'film', 'final', 'finally', 'financial', 'find', 'fine', 'finish',
  'fire', 'firm', 'fish', 'fit', 'five', 'fix', 'floor', 'fly', 'focus', 'follow', 'food',
  'foot', 'football', 'force', 'foreign', 'forget', 'form', 'former', 'forward', 'fight',
  'fourth', 'free', 'friend', 'from', 'front', 'full', 'fun', 'function', 'fund', 'future',
  'gain', 'game', 'garden', 'gas', 'gather', 'gave', 'general', 'generation', 'generous',
  'get', 'girl', 'give', 'glass', 'go', 'god', 'gold', 'golf', 'good', 'government',
  'great', 'green', 'group', 'grow', 'growth', 'guess', 'guest', 'guide', 'guy', 'hair',
  'half', 'hand', 'hang', 'happen', 'happy', 'hard', 'harm', 'head', 'health', 'heart',
  'heat', 'heavy', 'help', 'her', 'here', 'herself', 'hero', 'herself', 'high', 'himself',
  'history', 'hit', 'hold', 'hole', 'home', 'hope', 'hospital', 'hot', 'house', 'however',
  'huge', 'human', 'hundred', 'hungry', 'hunt', 'hurt', 'husband', 'i', 'idea', 'identify',
  'if', 'ignore', 'ill', 'image', 'imagine', 'impact', 'important', 'impossible', 'improve',
  'improvement', 'in', 'include', 'included', 'including', 'increase', 'increased',
  'indeed', 'indicate', 'indication', 'individual', 'industry', 'information', 'inside',
  'insist', 'instead', 'institution', 'interest', 'internal', 'international', 'into',
  'investment', 'involve', 'issue', 'it', 'itself', 'item', 'its', 'itself', 'january',
  'job', 'join', 'joint', 'judge', 'judgment', 'july', 'jump', 'june', 'just', 'keep',
  'key', 'kid', 'kill', 'kind', 'kitchen', 'knee', 'knock', 'know', 'knowledge', 'labor',
  'lack', 'land', 'language', 'large', 'last', 'late', 'later', 'laugh', 'law', 'lawyer',
  'lay', 'lead', 'leader', 'leadership', 'leading', 'learn', 'least', 'leave', 'left',
  'legal', 'less', 'let', 'letter', 'level', 'lie', 'life', 'light', 'like', 'likely',
  'line', 'list', 'listen', 'little', 'live', 'local', 'long', 'look', 'lose', 'loss',
  'lot', 'love', 'low', 'lunch', 'machine', 'magazine', 'main', 'maintain', 'major', 'make',
  'man', 'manage', 'management', 'manager', 'many', 'march', 'market', 'marriage', 'match',
  'material', 'matter', 'may', 'maybe', 'mayor', 'me', 'mean', 'meaning', 'measure',
  'media', 'medical', 'meet', 'meeting', 'member', 'memory', 'mention', 'message', 'method',
  'middle', 'might', 'military', 'million', 'mind', 'minute', 'miss', 'mission', 'mistake',
  'model', 'modern', 'moment', 'monday', 'money', 'month', 'more', 'morning', 'most',
  'mother', 'mouth', 'move', 'movement', 'movie', 'much', 'music', 'must', 'myself',
  'mystery', 'name', 'nation', 'national', 'nature', 'near', 'nearly', 'necessary', 'need',
  'negative', 'network', 'never', 'news', 'newspaper', 'next', 'nice', 'night', 'no',
  'nobody', 'none', 'north', 'nose', 'note', 'nothing', 'notice', 'november', 'now',
  'number', 'numerous', 'nurse', 'object', 'observation', 'observe', 'obvious', 'obviously',
  'occupation', 'occur', 'occurrence', 'october', 'off', 'offer', 'office', 'official',
  'often', 'oil', 'old', 'on', 'once', 'one', 'only', 'open', 'opening', 'operation',
  'opinion', 'opportunity', 'option', 'orange', 'order', 'organization', 'organizational',
  'organize', 'other', 'our', 'ourselves', 'out', 'outcome', 'outside', 'over', 'overall',
  'own', 'owner', 'paint', 'painting', 'paper', 'parent', 'park', 'part', 'participant',
  'particular', 'particularly', 'partner', 'party', 'pass', 'passage', 'passenger',
  'passion', 'past', 'patient', 'pattern', 'pause', 'pay', 'peace', 'people', 'perform',
  'performance', 'perhaps', 'period', 'person', 'personal', 'personnel', 'perspective',
  'phone', 'photo', 'photograph', 'physical', 'piano', 'pick', 'picture', 'piece', 'pink',
  'place', 'plan', 'planning', 'plant', 'plastic', 'plate', 'play', 'player', 'please',
  'pleasure', 'point', 'police', 'policy', 'political', 'politics', 'poor', 'popular',
  'population', 'position', 'positive', 'possible', 'possibly', 'post', 'power', 'practice',
  'prayer', 'precious', 'precise', 'prefer', 'preference', 'prepare', 'preparation',
  'presence', 'present', 'presentation', 'preserve', 'president', 'pressure', 'pretty',
  'prevent', 'price', 'pride', 'priest', 'primary', 'prime', 'principle', 'print', 'priority',
  'private', 'probably', 'problem', 'procedure', 'process', 'produce', 'product',
  'production', 'profession', 'professional', 'professor', 'program', 'progress', 'project',
  'promise', 'promote', 'promotion', 'proof', 'proper', 'properly', 'property', 'proposal',
  'propose', 'proposed', 'protect', 'protection', 'proud', 'prove', 'provide', 'province',
  'public', 'pull', 'purpose', 'push', 'put', 'quality', 'quarter', 'queen', 'question',
  'quickly', 'quiet', 'quite', 'race', 'radio', 'rail', 'rain', 'raise', 'range', 'rapid',
  'rate', 'rather', 'reach', 'read', 'ready', 'real', 'realize', 'really', 'reason',
  'receive', 'recent', 'recently', 'recipe', 'recognize', 'record', 'reduce', 'reduction',
  'reference', 'reflect', 'region', 'register', 'regular', 'regulation', 'relate', 'related',
  'relationship', 'relative', 'religion', 'remain', 'remember', 'remind', 'remove', 'report',
  'represent', 'representation', 'representative', 'republic', 'reputation', 'request',
  'require', 'requirement', 'research', 'researcher', 'reservation', 'reserve', 'resident',
  'residential', 'resistance', 'resort', 'resource', 'respect', 'response', 'responsibility',
  'responsible', 'rest', 'restaurant', 'result', 'retail', 'retain', 'retirement', 'return',
  'reveal', 'revenue', 'review', 'revolution', 'rich', 'ride', 'right', 'ring', 'rise',
  'risk', 'road', 'rock', 'role', 'rolling', 'room', 'rose', 'rough', 'round', 'route',
  'royal', 'rule', 'run', 'rural', 'russian', 'safe', 'sake', 'sale', 'salt', 'same',
  'sample', 'satisfy', 'saturday', 'sauce', 'save', 'say', 'scale', 'scene', 'school',
  'science', 'scientist', 'score', 'season', 'seat', 'second', 'secondary', 'section',
  'security', 'see', 'seek', 'seem', 'segment', 'selection', 'sell', 'senate', 'senator',
  'send', 'senior', 'sense', 'sensitive', 'sentence', 'separate', 'september', 'sequence',
  'series', 'serious', 'seriously', 'serve', 'service', 'session', 'set', 'seven', 'several',
  'severe', 'sex', 'sexual', 'shake', 'shape', 'share', 'sharp', 'she', 'sheet', 'shelf',
  'shell', 'shift', 'shine', 'ship', 'shirt', 'shock', 'shoot', 'shop', 'shore', 'short',
  'shot', 'shoulder', 'show', 'shutdown', 'sick', 'side', 'sight', 'sign', 'significant',
  'significantly', 'silence', 'similar', 'similarly', 'simple', 'simply', 'since', 'sing',
  'singer', 'single', 'sister', 'site', 'situation', 'six', 'size', 'skill', 'skin', 'small',
  'smile', 'smith', 'snow', 'so', 'social', 'society', 'soldier', 'sole', 'solution',
  'solve', 'someone', 'something', 'sometimes', 'son', 'song', 'soon', 'sorry', 'sort',
  'soul', 'sound', 'source', 'south', 'southern', 'space', 'spanish', 'speak', 'speaker',
  'special', 'specific', 'specifically', 'speech', 'spend', 'spending', 'spent', 'spirit',
  'spiritual', 'split', 'spoke', 'spokesman', 'sport', 'spring', 'staff', 'stage', 'stand',
  'standard', 'start', 'state', 'statement', 'station', 'stay', 'steady', 'step', 'stick',
  'still', 'stock', 'stop', 'storage', 'store', 'storm', 'story', 'strain', 'strange',
  'strategy', 'street', 'strength', 'stress', 'stretch', 'strict', 'strike', 'string',
  'strong', 'structure', 'struggle', 'student', 'studio', 'study', 'stuff', 'stupid',
  'style', 'subject', 'submit', 'subscribe', 'subscriber', 'subscription', 'subsequent',
  'substance', 'substantial', 'substantially', 'substitute', 'success', 'successful',
  'successfully', 'such', 'suddenly', 'suffer', 'suffering', 'sufficient', 'sugar', 'suggest',
  'suggestion', 'suit', 'summer', 'sunday', 'super', 'supply', 'support', 'supreme', 'sure',
  'surface', 'surgery', 'surprise', 'surprised', 'survey', 'survival', 'survive', 'suspect',
  'sustain', 'sweet', 'symbol', 'sympathy', 'symptom', 'system', 'table', 'take', 'talent',
  'talk', 'taste', 'tax', 'teacher', 'teaching', 'team', 'technology', 'telephone', 'tell',
  'temperature', 'temporary', 'tend', 'tendency', 'tennis', 'tension', 'tenth', 'term',
  'terminal', 'terms', 'terrible', 'terribly', 'territory', 'terror', 'terrorist', 'test',
  'text', 'thank', 'thanks', 'thanksgiving', 'that', 'the', 'theater', 'their', 'theirs',
  'them', 'themselves', 'then', 'theology', 'theoretical', 'theory', 'therapy', 'there',
  'therefore', 'thermal', 'these', 'thesis', 'they', 'thick', 'thin', 'thing', 'think',
  'thinking', 'third', 'thirst', 'thirty', 'this', 'thomas', 'though', 'thought', 'thousand',
  'threat', 'three', 'threshold', 'through', 'throughout', 'throw', 'thrown', 'thrust',
  'thursday', 'thus', 'ticket', 'tie', 'tight', 'time', 'timing', 'tiny', 'tip', 'title',
  'today', 'together', 'tomato', 'tomorrow', 'tone', 'tonight', 'too', 'took', 'tool',
  'tooth', 'topic', 'total', 'totally', 'tough', 'tour', 'tourism', 'tournament', 'toward',
  'towards', 'town', 'tradition', 'traditional', 'traditionally', 'tragedy', 'tragic',
  'train', 'training', 'transfer', 'transformation', 'transition', 'translate', 'translation',
  'transmission', 'transparent', 'transport', 'transportation', 'trauma', 'travel', 'traverse',
  'treat', 'treatment', 'treaty', 'tree', 'tremendous', 'trend', 'trial', 'tribute', 'trick',
  'trillion', 'trip', 'troop', 'trouble', 'truck', 'true', 'truly', 'truth', 'try', 'tuesday',
  'tumor', 'turkey', 'turn', 'tv', 'twenty', 'twice', 'twin', 'twist', 'two', 'type',
  'typical', 'typically', 'ultimate', 'ultimately', 'ultra', 'unable', 'uncertain', 'uncertainty',
  'uncle', 'under', 'understand', 'understanding', 'undertake', 'unemployment', 'unexpected',
  'unfortunately', 'union', 'unique', 'unit', 'united', 'unity', 'universal', 'universe',
  'university', 'unless', 'unlike', 'unlikely', 'unnecessary', 'unprecedented', 'unpredictable',
  'until', 'unusual', 'up', 'upper', 'upset', 'urban', 'urgency', 'urgent', 'us', 'usage',
  'use', 'used', 'useful', 'user', 'usual', 'usually', 'utility', 'vacation', 'vaccine',
  'valley', 'valuable', 'value', 'variety', 'various', 'vast', 'vehicle', 'vendor', 'venture',
  'venue', 'verbal', 'verify', 'version', 'versus', 'vertical', 'very', 'vessel', 'veteran',
  'viable', 'vice', 'victim', 'victory', 'video', 'view', 'village', 'violation', 'violence',
  'violent', 'viral', 'virgin', 'virus', 'virtually', 'virtue', 'virus', 'virus', 'visible',
  'vision', 'visit', 'visitor', 'visual', 'vital', 'vitamin', 'vocabulary', 'vocal', 'voice',
  'volume', 'volunteer', 'vote', 'voter', 'vulnerable', 'wage', 'wait', 'walk', 'wall',
  'want', 'warm', 'warning', 'wash', 'waste', 'watch', 'water', 'wave', 'way', 'wealth',
  'wealthy', 'weapon', 'wear', 'weather', 'wednesday', 'week', 'weekend', 'weekly', 'weight',
  'welcome', 'welfare', 'well', 'wellness', 'went', 'were', 'west', 'western', 'wet',
  'whatever', 'when', 'whenever', 'where', 'whereas', 'wherever', 'whether', 'which',
  'whichever', 'while', 'whisper', 'whistle', 'white', 'who', 'whole', 'wholesale', 'whom',
  'whomever', 'whose', 'why', 'wide', 'widely', 'widespread', 'widow', 'width', 'wife',
  'wild', 'wildlife', 'will', 'willing', 'wind', 'window', 'wine', 'wing', 'winner',
  'winter', 'wire', 'wisdom', 'wise', 'wish', 'with', 'within', 'without', 'woman',
  'women', 'wonder', 'wonderful', 'wood', 'wooden', 'wool', 'word', 'work', 'worker',
  'workforce', 'working', 'workout', 'workplace', 'world', 'worldwide', 'worry', 'worse',
  'worst', 'worth', 'worthy', 'would', 'wound', 'wrap', 'writer', 'writing', 'written',
  'wrong', 'yard', 'yeah', 'year', 'yearly', 'yellow', 'yes', 'yesterday', 'yet', 'yield',
  'you', 'young', 'younger', 'youngest', 'your', 'yourself', 'yourselves', 'youth', 'zero',
  'zone'
]);

/**
 * 分析英文文本的难度等级和复杂度
 */
async function analyzeText(text) {
  try {
    // 清理文本
    const cleanedText = text
      .replace(/[^\w\s'-]/g, ' ')
      .toLowerCase()
      .trim();

    // 基础统计
    const words = cleanedText.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = sentences.length;

    if (wordCount === 0) {
      return {
        wordCount: 0,
        readingLevel: 'A1',
        complexityScore: 0,
        sentenceCount: 0,
        averageWordLength: 0,
        uniqueWordRatio: 0,
      };
    }

    // 计算平均词长
    const totalCharacters = words.reduce((sum, w) => sum + w.length, 0);
    const averageWordLength = totalCharacters / wordCount;

    // 计算句子长度
    const averageSentenceLength = wordCount / Math.max(sentenceCount, 1);

    // 计算唯一词汇率
    const uniqueWords = new Set(words);
    const uniqueWordRatio = uniqueWords.size / wordCount;

    // 计算复杂词汇率（3字或以上的词汇，且不在常见词表中）
    const complexWords = words.filter(
      w => w.length >= 3 && !commonWords.has(w)
    );
    const complexWordRatio = complexWords.length / wordCount;

    // 计算复杂度分数 (0-100)
    let complexityScore = 0;

    // 词长因素 (贡献30%)
    // 平均词长越长，难度越高（最优: 4.5-5.5 字符）
    const optimalLength = 5;
    const lengthDiff = Math.abs(averageWordLength - optimalLength);
    const lengthScore = Math.max(0, 30 - lengthDiff * 5);
    complexityScore += lengthScore;

    // 复杂词汇因素 (贡献40%)
    complexityScore += complexWordRatio * 40;

    // 唯一词汇因素 (贡献20%)
    // 唯一词汇率越高，难度越高（最优: 0.5-0.7）
    const optimalUnique = 0.6;
    const uniqueDiff = Math.abs(uniqueWordRatio - optimalUnique);
    const uniqueScore = Math.max(0, 20 - uniqueDiff * 20);
    complexityScore += uniqueScore;

    // 句子长度因素 (贡献10%)
    // 较长的句子通常更复杂（最优: 15-20词/句）
    const optimalSentenceLength = 17;
    const sentenceLengthDiff = Math.abs(averageSentenceLength - optimalSentenceLength);
    const sentenceScore = Math.max(0, 10 - sentenceLengthDiff * 0.3);
    complexityScore += sentenceScore;

    complexityScore = Math.min(100, Math.round(complexityScore));

    // 根据复杂度分数判断阅读等级
    const readingLevel = getReadingLevel(
      complexityScore,
      averageWordLength,
      complexWordRatio
    );

    return {
      wordCount,
      sentenceCount,
      averageWordLength: parseFloat(averageWordLength.toFixed(2)),
      uniqueWordRatio: parseFloat(uniqueWordRatio.toFixed(3)),
      complexWordRatio: parseFloat(complexWordRatio.toFixed(3)),
      averageSentenceLength: parseFloat(averageSentenceLength.toFixed(2)),
      complexityScore,
      readingLevel,
    };
  } catch (error) {
    logger.error('文本分析错误:', error.message);
    throw error;
  }
}

/**
 * 根据复杂度指标判断阅读等级
 */
function getReadingLevel(complexityScore, avgWordLength, complexWordRatio) {
  // A1: 入门 (0-20)
  if (complexityScore < 20) {
    return 'A1';
  }
  // A2: 初级 (20-35)
  else if (complexityScore < 35) {
    return 'A2';
  }
  // B1: 中级 (35-55)
  else if (complexityScore < 55) {
    return 'B1';
  }
  // B2: 中上级 (55-70)
  else if (complexityScore < 70) {
    return 'B2';
  }
  // C1: 高级 (70-85)
  else if (complexityScore < 85) {
    return 'C1';
  }
  // C2: 精通 (85+)
  else {
    return 'C2';
  }
}

module.exports = {
  analyzeText,
  getReadingLevel,
};
