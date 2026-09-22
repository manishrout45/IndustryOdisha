import { useMemo, useState } from 'react';
import { articles, categories, comments as initialComments, dashboardStats } from './data/news.js';
import './App.css';

const navItems = ['Home', 'Categories', 'Search', 'Dashboard', 'About', 'Contact'];

function formatDate() {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());
}

function Header({ activeView, onNavigate, query, setQuery }) {
  return (
    <header className="site-header">
      <div className="top-strip">
        <span>Live news portal</span>
        <span>{formatDate()}</span>
      </div>
      <div className="header-main">
        <button className="brand" type="button" onClick={() => onNavigate('Home')}>
          <span className="brand-mark">NP</span>
          <span>
            <strong>NewsPortal</strong>
            <small>Fast, verified, useful</small>
          </span>
        </button>
        <label className="search-box">
          <span>Search news</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => onNavigate('Search')}
            placeholder="Politics, markets, tech..."
          />
        </label>
      </div>
      <nav className="nav-bar" aria-label="Primary navigation">
        {navItems.map((item) => (
          <button
            className={activeView === item ? 'active' : ''}
            key={item}
            type="button"
            onClick={() => onNavigate(item)}
          >
            {item}
          </button>
        ))}
      </nav>
    </header>
  );
}

function ArticleCard({ article, onOpen, compact = false }) {
  return (
    <article className={compact ? 'article-card compact' : 'article-card'}>
      <img src={article.image} alt="" />
      <div>
        <span className="pill">{article.category}</span>
        <h3>{article.title}</h3>
        <p>{article.excerpt}</p>
        <div className="story-meta">
          <span>{article.author}</span>
          <span>{article.minutes} min read</span>
        </div>
        <button className="text-button" type="button" onClick={() => onOpen(article)}>
          Read story
        </button>
      </div>
    </article>
  );
}

function Home({ onOpen, onNavigate }) {
  const lead = articles[0];
  const featured = articles.filter((article) => article.featured).slice(1);
  const trending = articles.filter((article) => article.trending);

  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <span className="pill">Top story</span>
          <h1>{lead.title}</h1>
          <p>{lead.excerpt}</p>
          <div className="actions">
            <button className="primary" type="button" onClick={() => onOpen(lead)}>
              Read lead story
            </button>
            <button className="secondary" type="button" onClick={() => onNavigate('Categories')}>
              Browse sections
            </button>
          </div>
        </div>
        <img className="hero-image" src={lead.image} alt="" />
      </section>

      <section className="section-grid two-column">
        <div>
          <div className="section-heading">
            <p>Featured</p>
            <h2>Editor picks</h2>
          </div>
          <div className="card-stack">
            {featured.map((article) => (
              <ArticleCard article={article} key={article.id} onOpen={onOpen} />
            ))}
          </div>
        </div>
        <aside className="panel">
          <div className="section-heading">
            <p>Trending</p>
            <h2>Most read now</h2>
          </div>
          {trending.map((article, index) => (
            <button className="trend-row" key={article.id} type="button" onClick={() => onOpen(article)}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{article.title}</strong>
            </button>
          ))}
        </aside>
      </section>
    </>
  );
}

function Categories({ onOpen }) {
  return (
    <section>
      <div className="section-heading">
        <p>Sections</p>
        <h1>Browse by category</h1>
      </div>
      <div className="category-grid">
        {categories.map((category) => {
          const categoryArticles =
            category === 'Top Stories'
              ? articles
              : articles.filter((article) => article.category === category);
          return (
            <section className="category-panel" key={category}>
              <h2>{category}</h2>
              <p>{categoryArticles.length} stories available</p>
              {categoryArticles.slice(0, 2).map((article) => (
                <button key={article.id} type="button" onClick={() => onOpen(article)}>
                  {article.title}
                </button>
              ))}
            </section>
          );
        })}
      </div>
    </section>
  );
}

function Search({ query, setQuery, onOpen }) {
  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return articles;
    return articles.filter((article) =>
      [article.title, article.category, article.author, article.excerpt].some((value) =>
        value.toLowerCase().includes(term),
      ),
    );
  }, [query]);

  return (
    <section>
      <div className="section-heading">
        <p>Find stories</p>
        <h1>Search the newsroom</h1>
      </div>
      <label className="wide-search">
        <span>Keyword</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try election, battery, film..."
        />
      </label>
      <div className="card-stack">
        {matches.map((article) => (
          <ArticleCard article={article} key={article.id} onOpen={onOpen} compact />
        ))}
      </div>
    </section>
  );
}

function ArticleView({ article, onNavigate }) {
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState('');

  function submitComment(event) {
    event.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    setComments([{ id: Date.now(), name: 'Reader', text }, ...comments]);
    setCommentText('');
  }

  return (
    <article className="article-detail">
      <button className="text-button" type="button" onClick={() => onNavigate('Home')}>
        Back to homepage
      </button>
      <span className="pill">{article.category}</span>
      <h1>{article.title}</h1>
      <div className="story-meta">
        <span>By {article.author}</span>
        <span>{article.minutes} min read</span>
      </div>
      <img src={article.image} alt="" />
      <p className="lead">{article.excerpt}</p>
      <p>{article.body}</p>

      <section className="comment-panel">
        <h2>Discussion</h2>
        <form className="comment-form" onSubmit={submitComment}>
          <textarea
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            placeholder="Add a thoughtful comment"
          />
          <button className="primary" type="submit">
            Post comment
          </button>
        </form>
        {comments.map((comment) => (
          <div className="comment" key={comment.id}>
            <strong>{comment.name}</strong>
            <p>{comment.text}</p>
          </div>
        ))}
      </section>
    </article>
  );
}

function Dashboard() {
  return (
    <section>
      <div className="section-heading">
        <p>Workspace</p>
        <h1>Editorial dashboard</h1>
      </div>
      <div className="stats-grid">
        {dashboardStats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <p>{stat.note}</p>
          </article>
        ))}
      </div>
      <section className="panel">
        <div className="section-heading">
          <p>Queue</p>
          <h2>Publishing workflow</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Story</th>
              <th>Section</th>
              <th>Status</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {articles.slice(0, 5).map((article, index) => (
              <tr key={article.id}>
                <td>{article.title}</td>
                <td>{article.category}</td>
                <td>{index % 2 === 0 ? 'Ready' : 'Editing'}</td>
                <td>{article.author}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </section>
  );
}

function InfoPage({ type }) {
  const isContact = type === 'Contact';

  return (
    <section className="info-page">
      <div className="section-heading">
        <p>{isContact ? 'Reach us' : 'About us'}</p>
        <h1>{isContact ? 'Contact the newsroom' : 'Independent reporting for busy readers'}</h1>
      </div>
      <p>
        {isContact
          ? 'Send tips, corrections, partnership requests, and reader feedback to the editorial team.'
          : 'NewsPortal is a complete frontend for a modern news product: homepage modules, article pages, search, category browsing, comments, and editorial workflow views.'}
      </p>
      <form className="contact-form">
        <label>
          Name
          <input placeholder="Your name" />
        </label>
        <label>
          Email
          <input placeholder="you@example.com" type="email" />
        </label>
        <label>
          Message
          <textarea placeholder="Write your message" />
        </label>
        <button className="primary" type="button">
          Send message
        </button>
      </form>
    </section>
  );
}

function AuthPanel() {
  const [mode, setMode] = useState('Login');

  return (
    <aside className="auth-panel">
      <div className="auth-tabs">
        {['Login', 'Register'].map((item) => (
          <button
            className={mode === item ? 'active' : ''}
            key={item}
            type="button"
            onClick={() => setMode(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <label>
        Email
        <input type="email" placeholder="editor@newsportal.com" />
      </label>
      <label>
        Password
        <input type="password" placeholder="Password" />
      </label>
      {mode === 'Register' && (
        <label>
          Role
          <select defaultValue="Reader">
            <option>Reader</option>
            <option>Author</option>
            <option>Editor</option>
          </select>
        </label>
      )}
      <button className="primary" type="button">
        {mode}
      </button>
    </aside>
  );
}

function Footer({ onNavigate }) {
  return (
    <footer className="site-footer">
      <div>
        <strong>NewsPortal</strong>
        <p>Full working React client for a news portal project.</p>
      </div>
      <div className="footer-links">
        {['Home', 'Categories', 'Dashboard', 'Contact'].map((item) => (
          <button key={item} type="button" onClick={() => onNavigate(item)}>
            {item}
          </button>
        ))}
      </div>
    </footer>
  );
}

export default function App() {
  const [activeView, setActiveView] = useState('Home');
  const [query, setQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);

  function navigate(view) {
    setSelectedArticle(null);
    setActiveView(view);
  }

  function openArticle(article) {
    setSelectedArticle(article);
    setActiveView('Article');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  let content;
  if (selectedArticle) {
    content = <ArticleView article={selectedArticle} onNavigate={navigate} />;
  } else if (activeView === 'Categories') {
    content = <Categories onOpen={openArticle} />;
  } else if (activeView === 'Search') {
    content = <Search query={query} setQuery={setQuery} onOpen={openArticle} />;
  } else if (activeView === 'Dashboard') {
    content = <Dashboard />;
  } else if (activeView === 'About' || activeView === 'Contact') {
    content = <InfoPage type={activeView} />;
  } else {
    content = <Home onOpen={openArticle} onNavigate={navigate} />;
  }

  return (
    <div className="app-shell">
      <Header activeView={activeView} onNavigate={navigate} query={query} setQuery={setQuery} />
      <main className="page">
        <div className="content">{content}</div>
        <AuthPanel />
      </main>
      <Footer onNavigate={navigate} />
    </div>
  );
}
