export const loadTranslation = async (lang) => {
  const langKey = lang.toLowerCase();
  try {
    const translationModule = await import(`./locales/${langKey}.json`);
    return translationModule.default || translationModule;
  } catch (error) {
    console.error(`Error loading language file for ${lang}:`, error);
    return {};
  }
};
