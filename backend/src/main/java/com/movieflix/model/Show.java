package com.movieflix.model;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Time;

/** Represents a single screening (show) */
public class Show {
    private int        id;
    private int        movieId;
    private int        theaterId;
    private Date       showDate;
    private Time       showTime;
    private BigDecimal priceStandard;
    private BigDecimal pricePremium;
    private boolean    seatsGenerated;

    // Extra fields joined from related tables (not DB columns)
    private String movieTitle;
    private String theaterName;
    private String theaterCity;

    public Show() {}

    public int        getId()                   { return id;              }
    public void       setId(int id)             { this.id = id;           }

    public int        getMovieId()              { return movieId;         }
    public void       setMovieId(int m)         { this.movieId = m;       }

    public int        getTheaterId()            { return theaterId;       }
    public void       setTheaterId(int t)       { this.theaterId = t;     }

    public Date       getShowDate()             { return showDate;        }
    public void       setShowDate(Date d)       { this.showDate = d;      }

    public Time       getShowTime()             { return showTime;        }
    public void       setShowTime(Time t)       { this.showTime = t;      }

    public BigDecimal getPriceStandard()        { return priceStandard;   }
    public void       setPriceStandard(BigDecimal p){ this.priceStandard = p;}

    public BigDecimal getPricePremium()         { return pricePremium;    }
    public void       setPricePremium(BigDecimal p) { this.pricePremium = p; }

    public boolean    isSeatsGenerated()        { return seatsGenerated;  }
    public void       setSeatsGenerated(boolean s){ this.seatsGenerated = s;}

    public String     getMovieTitle()           { return movieTitle;      }
    public void       setMovieTitle(String t)   { this.movieTitle = t;    }

    public String     getTheaterName()          { return theaterName;     }
    public void       setTheaterName(String t)  { this.theaterName = t;   }

    public String     getTheaterCity()          { return theaterCity;     }
    public void       setTheaterCity(String c)  { this.theaterCity = c;   }
}
