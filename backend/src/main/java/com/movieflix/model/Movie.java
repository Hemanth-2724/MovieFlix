package com.movieflix.model;

import java.math.BigDecimal;
import java.sql.Date;

/** Represents a movie */
public class Movie {
    private int        id;
    private String     title;
    private String     genre;
    private String     language;
    private BigDecimal rating;
    private int        durationMin;
    private String     posterUrl;
    private String     description;
    private Date       releaseDate;
    private boolean    isActive;

    public Movie() {}

    // ── Getters & Setters ──────────────────────────────────────────────
    public int        getId()                 { return id;              }
    public void       setId(int id)           { this.id = id;           }

    public String     getTitle()              { return title;           }
    public void       setTitle(String t)      { this.title = t;         }

    public String     getGenre()              { return genre;           }
    public void       setGenre(String g)      { this.genre = g;         }

    public String     getLanguage()           { return language;        }
    public void       setLanguage(String l)   { this.language = l;      }

    public BigDecimal getRating()             { return rating;          }
    public void       setRating(BigDecimal r) { this.rating = r;        }

    public int        getDurationMin()        { return durationMin;     }
    public void       setDurationMin(int d)   { this.durationMin = d;   }

    public String     getPosterUrl()          { return posterUrl;       }
    public void       setPosterUrl(String p)  { this.posterUrl = p;     }

    public String     getDescription()        { return description;     }
    public void       setDescription(String d){ this.description = d;   }

    public Date       getReleaseDate()        { return releaseDate;     }
    public void       setReleaseDate(Date rd) { this.releaseDate = rd;  }

    public boolean    isActive()              { return isActive;        }
    public void       setActive(boolean a)    { this.isActive = a;      }
}
