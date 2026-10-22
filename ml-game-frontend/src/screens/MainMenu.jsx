// Main menu: one centred glass panel with the title and Begin Lesson.
// (The robot image and subtitle are intentionally no longer rendered; the
// asset, the translation key and the display rules stay for later reuse.)
// The whole panel drops off-screen on exit (handled in App/CSS); the
// background image stays and blurs.

import { LANGS, LANGUAGE_SELECTOR_ENABLED } from '../i18n.js';

export default function MainMenu({ t, lang, setLang, exiting, onBegin, beginSound }) {
  return (
    <section
      className={'menu-screen' + (exiting ? ' menu-screen--exiting' : '')}
      aria-labelledby="menu-title"
    >
      <div className="menu-panel">
        <h1 id="menu-title" className="menu-panel__title">
          {t('menu.title')}
        </h1>
        <button
          type="button"
          className="btn btn--primary btn--big menu-panel__begin"
          onPointerDown={(e) => beginSound().onPointerDown(e)}
          onClick={(e) => {
            beginSound().onClick(e); // keyboard activation (Enter/Space) sound
            onBegin();
          }}
        >
          {t('menu.begin')}
        </button>
        {LANGUAGE_SELECTOR_ENABLED && (
          <label className="lang-select menu-panel__lang">
            <span className="lang-select__label">{t('lang.label')}</span>
            <select value={lang} onChange={(e) => setLang(e.target.value)}>
              {LANGS.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </section>
  );
}
