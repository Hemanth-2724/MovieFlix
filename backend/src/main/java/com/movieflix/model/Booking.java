package com.movieflix.model;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

/** Represents a confirmed ticket booking */
public class Booking {
    private int          id;
    private String       bookingReference;
    private int          userId;
    private int          showId;
    private BigDecimal   totalAmount;
    private String       paymentMode;    // "UPI" | "CREDIT_CARD" | "DEBIT_CARD"
    private String       paymentStatus;  // "SUCCESS" | "PENDING" | "FAILED"
    private Timestamp    bookedAt;

    // Joined / transient fields
    private List<String> seatLabels;
    private String       movieTitle;
    private String       theaterName;
    private String       showDate;
    private String       showTime;
    private String       userName;
    private String       userEmail;

    public Booking() {}

    public int        getId()                       { return id;               }
    public void       setId(int id)                 { this.id = id;            }

    public String     getBookingReference()                             { return bookingReference;      }
    public void       setBookingReference(String r)                     { this.bookingReference = r;    }

    public int        getUserId()                   { return userId;           }
    public void       setUserId(int u)              { this.userId = u;         }

    public int        getShowId()                   { return showId;           }
    public void       setShowId(int s)              { this.showId = s;         }

    public BigDecimal getTotalAmount()              { return totalAmount;      }
    public void       setTotalAmount(BigDecimal a)  { this.totalAmount = a;    }

    public String     getPaymentMode()              { return paymentMode;      }
    public void       setPaymentMode(String m)      { this.paymentMode = m;    }

    public String     getPaymentStatus()            { return paymentStatus;    }
    public void       setPaymentStatus(String s)    { this.paymentStatus = s;  }

    public Timestamp  getBookedAt()                 { return bookedAt;         }
    public void       setBookedAt(Timestamp t)      { this.bookedAt = t;       }

    public List<String> getSeatLabels()              { return seatLabels;       }
    public void         setSeatLabels(List<String> l){ this.seatLabels = l;     }

    public String     getMovieTitle()               { return movieTitle;       }
    public void       setMovieTitle(String t)       { this.movieTitle = t;     }

    public String     getTheaterName()              { return theaterName;      }
    public void       setTheaterName(String t)      { this.theaterName = t;    }

    public String     getShowDate()                 { return showDate;         }
    public void       setShowDate(String d)         { this.showDate = d;       }

    public String     getShowTime()                 { return showTime;         }
    public void       setShowTime(String t)         { this.showTime = t;       }

    public String     getUserName()                 { return userName;         }
    public void       setUserName(String n)         { this.userName = n;       }

    public String     getUserEmail()                { return userEmail;        }
    public void       setUserEmail(String e)        { this.userEmail = e;      }
}
